/** 객체 리스트 드로어 */
import { useBoardObjectsStore } from '../../../stores/useBoardObjectsStore'
import { ObjectFilterTabs, type ObjectFilter } from './ObjectFilterTabs'
import { ObjectListItem } from './ObjectListItem'

interface ObjectListDrawerProps {
    myUserId: string
    filter: ObjectFilter
    onFilterChange: (filter: ObjectFilter) => void
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function ObjectListDrawer({ myUserId, filter, onFilterChange, open, onOpenChange }: ObjectListDrawerProps) {
    const objects = useBoardObjectsStore((s) => s.objects)

    const filtered = objects.filter((o) => {
        if (filter === 'mine') return o.created_by === myUserId
        if (filter === 'others') return o.created_by !== myUserId
        return true
    })

    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                right: open ? 0 : -230,
                height: '100vh',
                width: 230,
                background: 'var(--color-bg)',
                borderLeft: '1px solid var(--color-border)',
                transition: 'right 0.2s ease',
                zIndex: 20,
                display: 'flex',
                flexDirection: 'column',
            }}
        >
            <button
                onClick={() => onOpenChange(!open)}
                aria-label={open ? '객체 리스트 닫기' : '객체 리스트 열기'}
                style={{
                    position: 'absolute',
                    left: -28,
                    top: 16,
                    width: 28,
                    height: 40,
                    border: '1px solid var(--color-border)',
                    borderRight: 'none',
                    borderRadius: '8px 0 0 8px',
                    background: 'var(--color-bg)',
                    cursor: 'pointer',
                    color: 'var(--color-text)',
                }}
            >
                {open ? '>' : '<'}
            </button>

            <div style={{ padding: 12, borderBottom: '1px solid var(--color-border)' }}>
                <ObjectFilterTabs value={filter} onChange={onFilterChange} />
            </div>

            <div style={{ flex: 1, overflowY: 'auto' }}>
                {filtered.length === 0 ? (
                    <p style={{ padding: 12, fontSize: 12, color: 'var(--color-text-muted)' }}>표시할 객체가 없어요</p>
                ) : (
                    filtered.map((object) => (
                        <ObjectListItem key={object.id} object={object} myUserId={myUserId} />
                    ))
                )}
            </div>
        </div>
    )
}