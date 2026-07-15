export type BoardFilter = 'all' | 'owner' | 'guest'

const TABS: { value: BoardFilter; label: string }[] = [
  { value: 'all', label: '전체' },
  { value: 'owner', label: '내가 만든 보드' },
  { value: 'guest', label: '참여 중인 보드' },
]

interface BoardFilterTabsProps {
  value: BoardFilter
  onChange: (value: BoardFilter) => void
}

export function BoardFilterTabs({ value, onChange }: BoardFilterTabsProps) {
  return (
    <div style={{ display: 'flex', gap: 8 }}>
      {TABS.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onChange(tab.value)}
          style={{
            padding: '6px 14px',
            borderRadius: 999,
            cursor: 'pointer',
            fontSize: 13,
            border: value === tab.value ? '1px solid var(--color-accent)' : '1px solid var(--color-border)',
            background: value === tab.value ? 'var(--color-accent)' : 'transparent',
            color: value === tab.value ? '#fff' : 'var(--color-text)',
          }}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
