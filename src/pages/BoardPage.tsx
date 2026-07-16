import { useEffect, useState } from 'react'
import { useParams, Navigate } from 'react-router-dom'
import { useSession } from '../hooks/useSession'
import { getBoardById } from '../lib/api/boards'
import type { Board } from '../types/board'
import type { BoardObjectType } from '../types/boardObject'
import { Canvas } from '../components/board/Canvas'
import { ObjectCreateMenu } from '../components/board/BottomToolbar/ObjectCreateMenu'


export function BoardPage() {
  const { boardId } = useParams<{ boardId: string }>()
  const { session, loading: sessionLoading } = useSession()
  const [board, setBoard] = useState<Board | null>(null)
  const [creationMode, setCreationMode] = useState<BoardObjectType | null>(null)

  useEffect(() => {
    if (!boardId) return
    getBoardById(boardId).then(setBoard)
  }, [boardId])

  if (sessionLoading) return null
  if (!session) return <Navigate to="/" replace />

  return (
    <div style={{ padding: 24 }}>
      <a href="/boards">← 내 보드 목록</a>
      <h1>{board?.title ?? '불러오는 중...'}</h1>
      {board && (
        <div style={{ position: 'relative' }}>
          <Canvas
            board={board}
            userId={session.user.id}
            creationMode={creationMode}
            onObjectCreated={() => setCreationMode(null)}
          />
          <ObjectCreateMenu activeMode={creationMode} onSelect={setCreationMode} />
        </div>
      )}
    </div>
  )
}
