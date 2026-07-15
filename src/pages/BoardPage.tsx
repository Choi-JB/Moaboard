import { useEffect, useState } from 'react'
import { useParams, Navigate } from 'react-router-dom'
import { useSession } from '../hooks/useSession'
import { getBoardById } from '../lib/api/boards'
import type { Board } from '../types/board'
import { Canvas } from '../components/board/Canvas'
/** 2주차에 실제 캔버스로 채워질 자리. 1주차에는 보드 생성 흐름 확인용 자리표시자. */
export function BoardPage() {
  const { boardId } = useParams<{ boardId: string }>()
  const { session, loading: sessionLoading } = useSession()
  const [board, setBoard] = useState<Board | null>(null)

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
      {board && <Canvas board={board} />}
    </div>
  )
}
