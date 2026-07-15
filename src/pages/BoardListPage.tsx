import { useEffect, useMemo, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useSession } from '../hooks/useSession'
import { supabase } from '../lib/supabaseClient'
import { listMyBoards, type BoardWithRole } from '../lib/api/boards'
import { getMemberCounts } from '../lib/api/boardMembers'
import { BoardCard } from '../components/boardList/BoardCard'
import { BoardFilterTabs, type BoardFilter } from '../components/boardList/BoardFilterTabs'
import { CreateBoardModal } from '../components/boardList/CreateBoardModal'

export function BoardListPage() {
  const { session, loading: sessionLoading } = useSession()
  const [boards, setBoards] = useState<BoardWithRole[]>([])
  const [memberCounts, setMemberCounts] = useState<Record<string, number>>({})
  const [loadingBoards, setLoadingBoards] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<BoardFilter>('all')
  const [modalOpen, setModalOpen] = useState(false)

  const userId = session?.user.id

  useEffect(() => {
    if (!userId) return
    let cancelled = false

    async function load() {
      setLoadingBoards(true)
      const list = await listMyBoards(userId!)
      const counts = await getMemberCounts(list.map((b) => b.id))
      if (!cancelled) {
        setBoards(list)
        setMemberCounts(counts)
        setLoadingBoards(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [userId])

  const visibleBoards = useMemo(() => {
    return boards
      .filter((b) => (filter === 'all' ? true : b.role === filter))
      .filter((b) => b.title.toLowerCase().includes(search.toLowerCase()))
  }, [boards, filter, search])

  if (sessionLoading) return null
  if (!session) return <Navigate to="/" replace />

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: 24 }}>
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 20,
        }}
      >
        <h1 style={{ fontSize: 20, margin: 0 }}>🗂 내 보드</h1>
        <button
          onClick={() => supabase.auth.signOut()}
          style={{
            background: 'none',
            border: '1px solid var(--color-border)',
            borderRadius: 8,
            padding: '6px 12px',
            cursor: 'pointer',
            color: 'var(--color-text)',
          }}
        >
          로그아웃
        </button>
      </header>

      <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="🔍 보드 검색"
          style={{
            flex: 1,
            padding: '10px 12px',
            borderRadius: 8,
            border: '1px solid var(--color-border)',
            background: 'var(--color-bg)',
            color: 'var(--color-text)',
          }}
        />
        <button
          onClick={() => setModalOpen(true)}
          style={{
            padding: '10px 16px',
            borderRadius: 8,
            border: '1px solid var(--color-accent)',
            background: 'var(--color-accent)',
            color: '#fff',
            cursor: 'pointer',
            fontWeight: 600,
          }}
        >
          + 새 보드
        </button>
      </div>

      <div style={{ marginBottom: 20 }}>
        <BoardFilterTabs value={filter} onChange={setFilter} />
      </div>

      {loadingBoards ? (
        <p style={{ color: 'var(--color-text-muted)' }}>불러오는 중...</p>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: 16,
          }}
        >
          {visibleBoards.map((board) => (
            <BoardCard key={board.id} board={board} memberCount={memberCounts[board.id] ?? 1} />
          ))}

          <button
            onClick={() => setModalOpen(true)}
            style={{
              minHeight: 140,
              borderRadius: 12,
              border: '1px dashed var(--color-border)',
              background: 'transparent',
              color: 'var(--color-text-muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            + 새 보드 만들기
          </button>
        </div>
      )}

      {modalOpen && userId && (
        <CreateBoardModal ownerId={userId} onClose={() => setModalOpen(false)} />
      )}
    </div>
  )
}
