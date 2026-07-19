/** 참여자 아바타 스택 */
import { usePresenceStore } from '../../stores/usePresenceStore'
import type { BoardRole } from '../../types/boardMember'

const ROLE_COLORS: Record<BoardRole, string> = {
  owner: '#F59E0B',
  guest: '#3B82F6',
  watcher: '#9CA3AF',
}

interface ParticipantAvatarStackProps {
  roleMap: Record<string, BoardRole>
}

export function ParticipantAvatarStack({ roleMap }: ParticipantAvatarStackProps) {
  const onlineUsers = usePresenceStore((s) => s.onlineUsers)

  return (
    <div style={{ display: 'flex' }}>
      {onlineUsers.map((user) => (
        <div
          key={user.userId}
          title={user.nickname}
          style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            background: user.avatarColor,
            border: `2px solid ${ROLE_COLORS[roleMap[user.userId] ?? 'watcher']}`,
            marginLeft: -8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          {user.nickname.slice(0, 1)}
        </div>
      ))}
    </div>
  )
}