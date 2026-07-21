/** 객체 필터 탭 */
export type ObjectFilter = 'all' | 'mine' | 'others'

const TABS: { value: ObjectFilter; label: string }[] = [
    { value: 'all', label: '전체' },
    { value: 'mine', label: '내것' },
    { value: 'others', label: '타인것' },
]

interface ObjectFilterTabsProps {
    value: ObjectFilter
    onChange: (value: ObjectFilter) => void
}

export function ObjectFilterTabs({ value, onChange }: ObjectFilterTabsProps) {
    return (
        <div style={{ display: 'flex', gap: 6 }}>
            {TABS.map((tab) => (
                <button
                    key={tab.value}
                    onClick={() => onChange(tab.value)}
                    style={{
                        flex: 1,
                        padding: '6px 8px',
                        borderRadius: 999,
                        cursor: 'pointer',
                        fontSize: 12,
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