import type { BoardObjectType } from '../../../types/boardObject'

interface ObjectCreateMenuProps {
    activeMode: BoardObjectType | null
    onSelect: (mode: BoardObjectType | null) => void
}

const ITEMS: { type: BoardObjectType; label: string }[] = [
    { type: 'memo', label: '메모' },
    { type: 'image', label: '이미지' },
]

export function ObjectCreateMenu({ activeMode, onSelect }: ObjectCreateMenuProps) {
    return (
        <div
            style={{
                position: 'absolute',
                bottom: 16,
                left: '50%',
                transform: 'translateX(-50%)',
                display: 'flex',
                gap: 8,
                padding: 8,
                borderRadius: 999,
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            }}
        >
            {ITEMS.map((item) => (
                <button
                    key={item.type}
                    onClick={() => onSelect(activeMode === item.type ? null : item.type)}
                    style={{
                        padding: '8px 16px',
                        borderRadius: 999,
                        border: 'none',
                        cursor: 'pointer',
                        fontWeight: 600,
                        background: activeMode === item.type ? 'var(--color-accent)' : 'transparent',
                        color: activeMode === item.type ? '#fff' : 'var(--color-text)',
                    }}
                >
                    {item.label}
                </button>
            ))}
        </div>
    )
}