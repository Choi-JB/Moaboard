/** 객체 리스트 아이템 */
import { usePresenceStore } from '../../../stores/usePresenceStore'
import { formatRelativeTime } from '../../../lib/relativeTime'
import type { BoardObject, MemoData } from '../../../types/boardObject'

interface ObjectListItemProps {
    object: BoardObject
    myUserId: string
}

const TYPE_ICON: Record<BoardObject['type'], string> = {
    memo: '📝',
    image: '🖼',
}

export function ObjectListItem({ object, myUserId }: ObjectListItemProps) {
    const onlineUsers = usePresenceStore((s) => s.onlineUsers)

    const isMine = object.created_by === myUserId
    const creatorNickname = isMine
        ? '나'
        : onlineUsers.find((u) => u.userId === object.created_by)?.nickname ?? '참여자'

    const summary =
        object.type === 'memo'
            ? (object.data as MemoData).content.trim() || '(빈 메모)'
            : '이미지'

    return (
        <div
            style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 8,
                padding: '8px 12px',
                borderBottom: '1px solid var(--color-border)',
                fontSize: 13,
            }}
        >
            <span>{TYPE_ICON[object.type]}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {summary}
                    {object.is_locked && ' 🔒'}
                </div>
                <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                    {creatorNickname} · {formatRelativeTime(object.created_at)}
                </div>
            </div>
        </div>
    )
}