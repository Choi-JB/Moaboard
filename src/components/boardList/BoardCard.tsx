import { useNavigate } from 'react-router-dom'
import type { BoardWithRole } from '../../lib/api/boards'
import { formatRelativeTime } from '../../lib/relativeTime'

interface BoardCardProps {
  board: BoardWithRole
  memberCount: number
}

const ROLE_LABEL: Record<BoardWithRole['role'], string> = {
  owner: 'owner',
  guest: 'guest',
  watcher: 'watcher',
}

export function BoardCard({ board, memberCount }: BoardCardProps) {
  const navigate = useNavigate()

  return (
    <button
      onClick={() => navigate(`/board/${board.id}`)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        textAlign: 'left',
        borderRadius: 12,
        border: '1px solid var(--color-border)',
        overflow: 'hidden',
        cursor: 'pointer',
        background: 'var(--color-surface)',
        padding: 0,
      }}
    >
      <div style={{ height: 80, background: board.background_color }} />
      <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 4 }}>
        <span
          style={{
            alignSelf: 'flex-start',
            fontSize: 11,
            fontWeight: 700,
            padding: '2px 8px',
            borderRadius: 999,
            background: 'var(--color-accent)',
            color: '#fff',
          }}
        >
          {ROLE_LABEL[board.role]}
        </span>
        <strong style={{ fontSize: 15 }}>{board.title}</strong>
        <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
          참여 {memberCount} · {formatRelativeTime(board.updated_at)}
        </span>
      </div>
    </button>
  )
}
