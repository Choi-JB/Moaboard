import { useEffect, useState } from 'react'
import { useParams, Navigate } from 'react-router-dom'
import { useSession } from '../hooks/useSession'
import { getBoardById } from '../lib/api/boards'
import type { Board } from '../types/board'
import type { BoardObjectType } from '../types/boardObject'
import { Canvas } from '../components/board/Canvas'
import { ObjectCreateMenu } from '../components/board/BottomToolbar/ObjectCreateMenu'
import { useRealtimeChannel } from '../hooks/useRealtimeChannel'

import { listMembers } from '../lib/api/boardMembers'
import type { BoardRole } from '../types/boardMember'
import { ParticipantAvatarStack } from '../components/board/ParticipantAvatarStack'

export function BoardPage() {
  const { boardId } = useParams<{ boardId: string }>()
  const { session, loading: sessionLoading } = useSession()
  const [board, setBoard] = useState<Board | null>(null)
  const [creationMode, setCreationMode] = useState<BoardObjectType | null>(null)
  const [roleMap, setRoleMap] = useState<Record<string, BoardRole>>({})

  /** 보드 정보 조회 */
  useEffect(() => {
    if (!boardId) return
    getBoardById(boardId).then(setBoard)

  }, [boardId])

  /** 보드 멤버 정보 조회 */
  useEffect(() => {
    if (!board) return
    listMembers(board.id).then((members) => {
      const map: Record<string, BoardRole> = {}
      for (const m of members) map[m.user_id] = m.role
      setRoleMap(map)
    })
  }, [board])

  //닉네임 조회
  const nickname = session?.user.user_metadata?.full_name ?? session?.user.email ?? '익명'
  //실시간 채널 연결
  const channel = useRealtimeChannel(board?.id ?? '', session?.user.id ?? '', nickname)

  if (sessionLoading) return null
  if (!session) return <Navigate to="/" replace />

  return (
    <div style={{ padding: 24 }}>
      <a href="/boards">← 내 보드 목록</a>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h1>{board?.title ?? '불러오는 중...'}</h1>
        <ParticipantAvatarStack roleMap={roleMap} />
      </div>
      
      {board && (
        <div style={{ position: 'relative' }}>
          <Canvas
            board={board}
            userId={session.user.id}
            creationMode={creationMode}
            onObjectCreated={() => setCreationMode(null)}
            channel={channel ?? null}
          />
          <ObjectCreateMenu activeMode={creationMode} onSelect={setCreationMode} />
        </div>
      )}

    </div>
  )
}
