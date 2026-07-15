-- 모아보드 DB 스키마 + RLS 정책
-- 참고 문서: docs/모아보드_기능명세서.md, docs/RLS정책_API명세서.md
-- 적용 방법: Supabase 대시보드 > SQL Editor에 이 파일 전체를 붙여넣고 실행

-- =========================================================
-- 1. 테이블
-- =========================================================

create table if not exists "USER" (
  id uuid primary key references auth.users (id) on delete cascade,
  email text unique,
  nick text,
  is_anonymous boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists "BOARD" (
  id uuid primary key default gen_random_uuid(),
  title text not null default '제목 없는 보드',
  owner_id uuid not null references "USER" (id) on delete cascade,
  invite_token text not null unique default gen_random_uuid()::text,
  canvas_size text not null default 'fhd' check (canvas_size in ('fhd', 'qhd', 'uhd')),
  theme text,
  background_color text not null default '#FFFFFF',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists "BOARD_MEMBER" (
  id uuid primary key default gen_random_uuid(),
  board_id uuid not null references "BOARD" (id) on delete cascade,
  user_id uuid not null references "USER" (id) on delete cascade,
  role text not null default 'watcher' check (role in ('owner', 'guest', 'watcher')),
  joined_at timestamptz not null default now(),
  unique (board_id, user_id)
);

create table if not exists "BOARD_OBJECTS" (
  id uuid primary key default gen_random_uuid(),
  board_id uuid not null references "BOARD" (id) on delete cascade,
  type text not null check (type in ('memo', 'image')),
  pos_x float not null default 0,
  pos_y float not null default 0,
  width float not null default 200,
  height float not null default 200,
  z_index int not null default 0,
  data jsonb not null default '{}'::jsonb,
  created_by uuid not null references "USER" (id) on delete cascade,
  is_locked boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

-- =========================================================
-- 2. auth.users → "USER" 동기화 트리거
-- Supabase Auth(구글 로그인/익명 로그인)로 새 계정이 생기면
-- 애플리케이션 테이블인 "USER"에도 동일 id로 행을 만들어둔다.
-- =========================================================

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into "USER" (id, email, nick, is_anonymous)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    new.is_anonymous
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_auth_user();

-- BOARD.updated_at 자동 갱신
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists board_set_updated_at on "BOARD";
create trigger board_set_updated_at
  before update on "BOARD"
  for each row execute procedure public.set_updated_at();

drop trigger if exists board_objects_set_updated_at on "BOARD_OBJECTS";
create trigger board_objects_set_updated_at
  before update on "BOARD_OBJECTS"
  for each row execute procedure public.set_updated_at();

-- =========================================================
-- 3. 역할 조회 헬퍼 함수
-- =========================================================

create or replace function get_board_role(p_board_id uuid, p_user_id uuid)
returns text
language sql
security definer
stable
as $$
  select role
  from "BOARD_MEMBER"
  where board_id = p_board_id and user_id = p_user_id
  limit 1;
$$;

-- =========================================================
-- 4. RLS 정책
-- =========================================================

alter table "USER" enable row level security;

create policy "user_select_all"
on "USER" for select
using (true);

create policy "user_update_own"
on "USER" for update
using (id = auth.uid());

alter table "BOARD" enable row level security;

-- owner_id 조건을 추가하는 이유: INSERT 직후 .select()로 방금 만든 행을 반환받을 때도
-- SELECT 정책이 함께 적용되는데, 그 시점엔 아직 board_member에 owner 등록이 안 되어 있어
-- get_board_role만으로는 항상 실패한다. owner_id = auth.uid() 조건으로 이 문제를 피한다.
create policy "board_select_member_only"
on "BOARD" for select
using (
  owner_id = auth.uid()
  or get_board_role(id, auth.uid()) is not null
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

alter table "BOARD_MEMBER" enable row level security;

create policy "member_select_same_board"
on "BOARD_MEMBER" for select
using (get_board_role(board_id, auth.uid()) is not null);

create policy "member_insert_self_only"
on "BOARD_MEMBER" for insert
with check (user_id = auth.uid());

create policy "member_update_owner_only"
on "BOARD_MEMBER" for update
using (get_board_role(board_id, auth.uid()) = 'owner');

create policy "member_delete_self_or_owner"
on "BOARD_MEMBER" for delete
using (
  user_id = auth.uid()
  or get_board_role(board_id, auth.uid()) = 'owner'
);

alter table "BOARD_OBJECTS" enable row level security;

create policy "object_select_member"
on "BOARD_OBJECTS" for select
using (get_board_role(board_id, auth.uid()) is not null);

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

create policy "object_update_permission"
on "BOARD_OBJECTS" for update
using (
  case
    when is_locked = true then get_board_role(board_id, auth.uid()) = 'owner'
    else get_board_role(board_id, auth.uid()) in ('owner', 'guest')
  end
);

create policy "object_delete_service_only"
on "BOARD_OBJECTS" for delete
using (false);

-- =========================================================
-- 5. 매일 00시 휴지통 완전 삭제 (pg_cron)
-- pg_cron 확장이 활성화된 프로젝트에서만 실행
-- =========================================================

-- select cron.schedule(
--   'purge-deleted-board-objects',
--   '0 0 * * *',
--   $$delete from "BOARD_OBJECTS" where deleted_at is not null and deleted_at < now() - interval '1 day'$$
-- );
