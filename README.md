# 모아보드 (moaboard)

여러 명이 실시간으로 동시 접속해 메모와 이미지를 자유롭게 배치하는 온라인 화이트보드입니다.

## 기술 스택
- React + Vite + TypeScript
- Zustand (상태 관리)
- Supabase (Auth, Postgres, Realtime)
- react-router-dom

## 로컬 실행

1. 의존성 설치
npm install


2. Supabase 프로젝트 준비
- [supabase.com](https://supabase.com)에서 프로젝트 생성
- SQL Editor에서 `supabase/schema.sql` 전체 실행
- Authentication → Providers에서 Google, Anonymous 로그인 활성화
- Authentication → URL Configuration에서 Site URL / Redirect URLs에 로컬 개발 주소(`http://localhost:5173`) 등록

3. 환경변수 설정
copy .env.example .env

`.env`에 Supabase 프로젝트의 URL과 anon key 입력

4. 개발 서버 실행
npm run dev


## 폴더 구조
- `src/pages/` — 라우트 단위 화면
- `src/components/` — 화면 구성 컴포넌트 (`board/`, `boardList/`, `auth/`, `ui/`)
- `src/stores/` — Zustand 전역 상태
- `src/hooks/` — 커스텀 훅 (세션, 실시간 채널, 자동 저장 등)
- `src/lib/api/` — Supabase 테이블 호출 코드
- `src/types/` — 도메인 타입 정의
- `supabase/schema.sql` — DB 스키마 + RLS 정책

더 자세한 설계 배경은 `docs/` 폴더의 설계 문서들을 참고하세요.

## 주요 기능
- 구글/익명 로그인, 초대 링크로 보드 참여
- 메모/이미지 객체 생성·이동·삭제 (자동 저장)
- 실시간 동기화 (Postgres Changes, Broadcast, Presence)
- 동시 편집 표시(소프트 락)
- 권한 관리(owner/guest/watcher), 보드 설정, 익명→구글 계정 연동