# RLS 정책 설계 & API 명세서 (Supabase 기준)

## 0. 읽기 전 알아두면 좋은 개념

Supabase는 프론트엔드가 DB 테이블에 **직접** 접근합니다. 예를 들어 "메모 하나 가져오기"는 별도 서버 API를 거치지 않고, 프론트에서 아래처럼 바로 DB를 조회해요.

```js
const { data } = await supabase.from('board_objects').select('*').eq('board_id', boardId)
```

문제는 이렇게 두면 **아무나 아무 데이터나 볼 수 있고 고칠 수 있게** 돼요. 이걸 막는 게 **RLS(Row Level Security)**예요. "이 테이블의 이 행(row)은 어떤 조건을 만족하는 사람만 읽기/쓰기 가능"이라는 규칙을 DB 자체에 걸어두는 기능입니다.

즉, 우리가 앞서 문서로 정리한 권한 매트릭스(owner/guest/watcher)를 **실제로 강제하는 부분이 바로 이 RLS**예요. 프론트에서 "watcher는 버튼 안 보이게" 처리해도, 그건 화면만 숨긴 거라 개발자도구로 우회 요청을 보내면 뚫려요. RLS가 있어야 DB 레벨에서 진짜로 막힙니다.

---

## 1. 공통 준비: "이 유저가 이 보드에서 무슨 역할인지" 확인하는 함수

모든 정책에서 반복적으로 "이 사람이 owner인지 guest인지 watcher인지"를 확인해야 하므로, 재사용 가능한 함수를 하나 만들어둡니다.

```sql
create or replace function get_board_role(p_board_id uuid, p_user_id uuid)
returns text
language sql
security definer
stable
as $$
  select role
  from board_member
  where board_id = p_board_id and user_id = p_user_id
  limit 1;
$$;
```

이 함수는 "board_member 테이블에서 이 유저의 role을 찾아 반환"하는 역할이에요. 이후 정책들은 이 함수를 계속 재사용합니다.

---

## 2. 테이블별 RLS 정책

### 2-1. USER 테이블

| 정책 | 조건 |
|---|---|
| SELECT | 모든 로그인 유저가 다른 유저의 기본 정보(닉네임 등) 조회 가능 (참여자 목록 표시용) |
| UPDATE | 본인 행만 수정 가능 |
| INSERT/DELETE | Supabase Auth가 자동 처리 (직접 정책 불필요) |

```sql
alter table "USER" enable row level security;

-- 모두 조회 가능 (참여자 목록에 닉네임 표시 등에 필요)
create policy "user_select_all"
on "USER" for select
using (true);

-- 본인 정보만 수정 가능
create policy "user_update_own"
on "USER" for update
using (id = auth.uid());
```

### 2-2. BOARD 테이블

| 정책 | 조건 |
|---|---|
| SELECT | 해당 보드의 board_member에 속한 유저만 조회 가능 |
| INSERT | 로그인(익명 포함)된 모든 유저가 보드 생성 가능 |
| UPDATE | owner만 가능 (설정 변경) |
| DELETE | owner만 가능 |

```sql
alter table "BOARD" enable row level security;

create policy "board_select_member_only"
on "BOARD" for select
using (
  get_board_role(id, auth.uid()) is not null
);

create policy "board_insert_any_logged_in"
on "BOARD" for insert
with check (auth.uid() is not null);

create policy "board_update_owner_only"
on "BOARD" for update
using (owner_id = auth.uid());

create policy "board_delete_owner_only"
on "BOARD" for delete
using (owner_id = auth.uid());
```

### 2-3. BOARD_MEMBER 테이블 (참여자 & 권한)

| 정책 | 조건 |
|---|---|
| SELECT | 같은 보드 멤버끼리는 서로의 role 조회 가능 |
| INSERT | 초대 링크로 접속 시 본인을 watcher로 등록 (본인 row만 생성 가능) |
| UPDATE | role 변경은 owner만 가능 |
| DELETE | 본인 스스로 나가기는 가능, 강퇴는 owner만 가능 |

```sql
alter table "BOARD_MEMBER" enable row level security;

create policy "member_select_same_board"
on "BOARD_MEMBER" for select
using (
  get_board_role(board_id, auth.uid()) is not null
);

-- 본인을 해당 보드의 멤버로 등록하는 것만 허용 (역할은 서버 기본값 watcher)
create policy "member_insert_self_only"
on "BOARD_MEMBER" for insert
with check (user_id = auth.uid());

-- role 변경은 owner만
create policy "member_update_owner_only"
on "BOARD_MEMBER" for update
using (get_board_role(board_id, auth.uid()) = 'owner');

-- 본인 탈퇴 or owner의 강퇴
create policy "member_delete_self_or_owner"
on "BOARD_MEMBER" for delete
using (
  user_id = auth.uid()
  or get_board_role(board_id, auth.uid()) = 'owner'
);
```

### 2-4. BOARD_OBJECTS 테이블 (핵심 — 가장 복잡한 부분)

| 정책 | 조건 |
|---|---|
| SELECT | 보드 멤버(owner/guest/watcher 모두)면 조회 가능 |
| INSERT | owner 또는 guest만 가능, **보드당 200개 제한 체크 포함** |
| UPDATE | 잠기지 않은 객체는 owner/guest 모두, 잠긴 객체는 owner만 |
| DELETE | 실제로는 하드 삭제 대신 `deleted_at` 업데이트 방식이므로, DELETE 정책은 cron(서버 권한)에게만 허용 |

```sql
alter table "BOARD_OBJECTS" enable row level security;

-- 조회: 보드 멤버라면 누구나 (watcher 포함)
create policy "object_select_member"
on "BOARD_OBJECTS" for select
using (
  get_board_role(board_id, auth.uid()) is not null
);

-- 생성: owner/guest만, 보드당 활성 객체 200개 미만일 때만
create policy "object_insert_owner_or_guest"
on "BOARD_OBJECTS" for insert
with check (
  get_board_role(board_id, auth.uid()) in ('owner', 'guest')
  and (
    select count(*) from "BOARD_OBJECTS"
    where board_id = "BOARD_OBJECTS".board_id
      and deleted_at is null
  ) < 200
);

-- 수정: 잠기지 않았으면 owner/guest, 잠겼으면 owner만
create policy "object_update_permission"
on "BOARD_OBJECTS" for update
using (
  case
    when is_locked = true then get_board_role(board_id, auth.uid()) = 'owner'
    else get_board_role(board_id, auth.uid()) in ('owner', 'guest')
  end
);

-- 삭제(하드 delete)는 프론트에서 직접 호출 못하게 막고, cron 전용 서버 권한만 허용
create policy "object_delete_service_only"
on "BOARD_OBJECTS" for delete
using (false);  -- 프론트에서는 항상 차단, service_role 키로만 cron이 실행
```

> **참고**: "삭제 = 휴지통 이동"은 실제로는 DELETE가 아니라 `deleted_at` 값을 채우는 **UPDATE**예요. 그래서 진짜 DELETE 권한은 아무에게도 안 주고, `deleted_at` 업데이트는 위 `object_update_permission` 정책을 그대로 따릅니다. 다음날 00시에 실제로 행을 지우는 pg_cron 작업만 `service_role`(관리자 권한, RLS 우회)로 실행돼요.

---

## 3. API 명세 (Supabase 방식)

전통적인 REST API처럼 별도 엔드포인트를 만드는 게 아니라, **프론트에서 Supabase 클라이언트로 테이블을 직접 호출**하는 방식이에요. 기능별로 정리하면 아래와 같습니다.

### FT-01. 초대 링크로 입장

```js
// 1. 링크의 invite_token으로 보드 찾기
const { data: board } = await supabase
  .from('BOARD')
  .select('id')
  .eq('invite_token', token)
  .single()

// 2. 본인을 watcher로 등록 (이미 있으면 무시)
await supabase
  .from('BOARD_MEMBER')
  .upsert({ board_id: board.id, user_id: myUserId, role: 'watcher' }, { onConflict: 'board_id,user_id', ignoreDuplicates: true })
```

### FT-02. 권한 변경 (owner 전용)

```js
await supabase
  .from('BOARD_MEMBER')
  .update({ role: 'guest' })  // 또는 'watcher'
  .eq('board_id', boardId)
  .eq('user_id', targetUserId)
// RLS가 owner인지 자동으로 검증함 (실패 시 에러 반환)
```

### FT-03. 객체 생성/이동/삭제/잠금

```js
// 생성
await supabase.from('BOARD_OBJECTS').insert({
  board_id: boardId, type: 'memo', pos_x: 100, pos_y: 100,
  width: 200, height: 200, data: { content: '', color: '#FFEB3B' },
  created_by: myUserId
})

// 이동 (드래그 종료 시점에 1회 호출)
await supabase.from('BOARD_OBJECTS')
  .update({ pos_x: newX, pos_y: newY })
  .eq('id', objectId)

// 삭제 (휴지통 이동 = deleted_at 기록)
await supabase.from('BOARD_OBJECTS')
  .update({ deleted_at: new Date().toISOString() })
  .eq('id', objectId)

// 잠금 (owner만 성공)
await supabase.from('BOARD_OBJECTS')
  .update({ is_locked: true })
  .eq('id', objectId)
```

### FT-04. 객체 리스트 & 필터

```js
// 전체
const { data } = await supabase
  .from('BOARD_OBJECTS')
  .select('*')
  .eq('board_id', boardId)
  .is('deleted_at', null)

// 필터는 서버 쿼리보다 프론트에서 created_by 기준으로 필터링하는 게 간단함
const myObjects = data.filter(o => o.created_by === myUserId)
```

### FT-05. 실시간 동기화 (Realtime 구독)

```js
supabase
  .channel(`board-${boardId}`)
  .on('postgres_changes', {
    event: '*', schema: 'public', table: 'BOARD_OBJECTS',
    filter: `board_id=eq.${boardId}`
  }, (payload) => {
    // payload.eventType: INSERT / UPDATE / DELETE
    // 여기서 로컬 상태 갱신
  })
  .subscribe()
```

### FT-06. 보드 설정 변경 (owner 전용)

```js
await supabase.from('BOARD')
  .update({ canvas_size: 'qhd', theme: 'dark' })
  .eq('id', boardId)
```

---

## 4. 서버(Edge Function/Cron)가 필요한 부분

RLS는 "요청 한 건이 허용되는지"만 판단해요. 아래처럼 **주기적으로 실행되는 로직**은 프론트 호출이 아니라 별도 스케줄로 처리해야 합니다.

| 작업 | 방식 |
|---|---|
| 삭제 유예기간 지난 객체 완전 삭제 | pg_cron으로 매일 00시 `delete from "BOARD_OBJECTS" where deleted_at < now() - interval '...'` 실행 |

---

## 5. 다음 단계 제안
- 위 SQL을 Supabase SQL Editor에 순서대로 붙여넣기 (함수 → 테이블별 RLS 순서)
- 정책 하나 만들 때마다 Supabase 대시보드의 "Table Editor"에서 다른 계정으로 테스트 (본인 데이터만 보이는지 확인)
- 로컬 개발 시에는 `supabase.auth.getUser()`로 로그인 안 된 상태를 확인하며 각 정책이 의도대로 막는지 체크

궁금한 정책 있으면 어떤 상황에서 왜 이렇게 막히는지 하나씩 풀어서 설명해드릴게요.
