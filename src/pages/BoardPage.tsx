import { useEffect, useState } from 'react'
import { useParams, useNavigate, Navigate, Link } from 'react-router-dom'
import { useSession } from '../hooks/useSession'
import { getBoardById } from '../lib/api/boards'
import type { Board } from '../types/board'
import type { BoardObjectType } from '../types/boardObject'
import { Canvas } from '../components/board/Canvas'
import { ObjectCreateMenu } from '../components/board/BottomToolbar/ObjectCreateMenu'
import { useRealtimeChannel } from '../hooks/useRealtimeChannel'
/** 임시 익명 로그인 */
// import { joinAsWatcher } from '../lib/api/boardMembers'
// import { supabase } from '../lib/supabaseClient'

import { listMembers } from '../lib/api/boardMembers'
import type { BoardRole } from '../types/boardMember'
import { ParticipantAvatarStack } from '../components/board/ParticipantAvatarStack'
import { SettingsPanel } from '../components/board/SettingsPanel/SettingsPanel'
import { ObjectListDrawer } from '../components/board/ObjectListDrawer/ObjectListDrawer'
import type { ObjectFilter } from '../components/board/ObjectListDrawer/ObjectFilterTabs'


export function BoardPage() {
  const { boardId } = useParams<{ boardId: string }>()
  const { session, loading: sessionLoading } = useSession()
  const [board, setBoard] = useState<Board | null>(null)
  const [creationMode, setCreationMode] = useState<BoardObjectType | null>(null)
  const [roleMap, setRoleMap] = useState<Record<string, BoardRole>>({})
  const [boardNotFound, setBoardNotFound] = useState(false)

  const [settingsOpen, setSettingsOpen] = useState(false)
  const navigate = useNavigate()
  const [objectFilter, setObjectFilter] = useState<ObjectFilter>('all')
  const [drawerOpen, setDrawerOpen] = useState(false)

  const myRole = roleMap[session?.user.id ?? '']
  const canEdit = myRole === 'owner' || myRole === 'guest'
  // TEMP: 소프트 락 테스트용 임시 우회 — 세션이 없으면 익명으로 자동 로그인.
  // 4주차에 진짜 초대 링크(/invite/:token) 흐름이 생기면 이 부분은 제거.
  // useEffect(() => {
  //   if (sessionLoading || session) return
  //   supabase.auth.signInAnonymously()
  // }, [session, sessionLoading])

  // TEMP: 익명 유저를 이 보드의 watcher로 자동 등록한 뒤 보드 정보 조회.
  // 이미 멤버(owner 등)인 경우 joinAsWatcher는 ignoreDuplicates라 안전하게 no-op.
  // useEffect(() => {
  //   if (!boardId || !session) return
  //   joinAsWatcher(boardId, session.user.id).then(() => {
  //     getBoardById(boardId).then(setBoard)
  //   })
  // }, [boardId, session])

  //보드 멤버 정보 동기화 함수
  function refetchRoleMap(currentBoard: Board) {
    if (!currentBoard) return
    listMembers(currentBoard.id).then((members) => {
      const map: Record<string, BoardRole> = {}
      for (const m of members) map[m.user_id] = m.role
      setRoleMap(map) //보드 멤버 정보 업데이트
    })
  }

  /** 보드 정보 조회 (로그인된 유저만)*/
  useEffect(() => {
    if (!boardId) return
    getBoardById(boardId)
      .then((result) => {
        if (result) setBoard(result)
        else setBoardNotFound(true)
      })
      .catch(() => setBoardNotFound(true))
  }, [boardId])

  /** 보드 멤버 정보 조회 */
  useEffect(() => {
    if (!board) return
    refetchRoleMap(board)
  }, [board])

  //닉네임 조회
  const nickname = session?.user.user_metadata?.full_name ?? session?.user.email ?? '익명'
  //실시간 채널 연결
  const channel = useRealtimeChannel(
    board?.id ?? '',
    session?.user.id ?? '',
    nickname,
    () => board && refetchRoleMap(board),
    (event) => {
      if (event.type === 'removed') {
        setRoleMap((prev) => {
          const next = { ...prev }
          delete next[event.userId]
          return next
        })
        if (session && event.userId === session.user.id) {
          navigate('/boards') //강퇴당한 본인이면 보드 목록으로 이동
        }
      } else {
        setRoleMap((prev) => ({ ...prev, [event.userId]: event.role }))
      }
    }
  ) //재연결 시 보드 멤버 정보 동기화

  // TEMP: 로그인 강제 리다이렉트 대신, 익명 로그인이 끝날 때까지 잠깐 대기만 함
  //if (sessionLoading || !session) return null

  //기존 코드 주석 처리
  if (sessionLoading) return null
  if (!session) return <Navigate to="/" replace />

  // 보드를 찾을 수 없는 경우
  if (boardNotFound) {
    return (
      <div
      style={{
        minHeight: '100svh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        textAlign: 'center',
        padding: 24,
      }}
    >
      <div style={{ fontSize: 48 }}>⛔</div>
      <div>
        <h1 style={{ fontSize: 20, margin: '0 0 8px' }}>보드를 찾을 수 없어요</h1>
        <p style={{ margin: 0, color: 'var(--color-text-muted)' }}>
          삭제되었거나 접근할 수 없는 보드예요
        </p>
      </div>
      <Link
        to="/boards"
        style={{
          padding: '10px 16px',
          borderRadius: 8,
          background: 'var(--color-accent)',
          color: '#fff',
          textDecoration: 'none',
          fontWeight: 600,
        }}
      >
        내 보드 목록으로 이동
      </Link>
    </div>
    )
  }

  return (
    <div style={{ padding: 24 }}>
      <a href="/boards">← 내 보드 목록</a>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {roleMap[session.user.id] === 'owner' && (
            <button
              onClick={() => setSettingsOpen(true)}
              style={{
                background: 'none',
                border: '1px solid var(--color-border)',
                borderRadius: 8,
                padding: '6px 12px',
                cursor: 'pointer',
                color: 'var(--color-text)',
              }}
            >
              ⚙ 설정
            </button>
          )}
          <h1>{board?.title ?? '불러오는 중...'}</h1>
        </div>
        <ParticipantAvatarStack boardId={board?.id ?? ''} myUserId={session.user.id} roleMap={roleMap} />
      </div>

      {settingsOpen && board && (
        <SettingsPanel
          board={board}
          onClose={() => setSettingsOpen(false)}
          onUpdated={setBoard}
          onDeleted={() => navigate('/boards')}
        />
      )}
      {board && (
        <div style={{ position: 'relative' }}>
          <Canvas
            board={board}
            userId={session.user.id}
            nickname={nickname}
            creationMode={creationMode}
            onObjectCreated={() => setCreationMode(null)}
            channel={channel ?? null}
            objectFilter={drawerOpen ? objectFilter : 'all'}
            canEdit={canEdit}
          />
          {canEdit && <ObjectCreateMenu activeMode={creationMode} onSelect={setCreationMode} />}
        </div>
      )}

      {board && (
        <ObjectListDrawer
          myUserId={session.user.id}
          filter={objectFilter}
          onFilterChange={setObjectFilter}
          open={drawerOpen}
          onOpenChange={setDrawerOpen}
        />
      )}

    </div>
  )
}
