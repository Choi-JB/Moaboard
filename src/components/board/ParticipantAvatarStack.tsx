/** 참여자 아바타 스택 */
import { useState } from 'react'
import { usePresenceStore } from '../../stores/usePresenceStore'
import { updateRole, removeMember } from '../../lib/api/boardMembers'
import { PermissionDropdown } from './TopBar/PermissionDropdown'
import type { BoardRole } from '../../types/boardMember'

const ROLE_COLORS: Record<BoardRole, string> = {
  owner: '#F59E0B',
  guest: '#3B82F6',
  watcher: '#9CA3AF',
}

interface ParticipantAvatarStackProps {
  boardId: string
  myUserId: string
  roleMap: Record<string, BoardRole>
}

export function ParticipantAvatarStack({ boardId, myUserId, roleMap }: ParticipantAvatarStackProps) {
  const onlineUsers = usePresenceStore((s) => s.onlineUsers)
  const [openUserId, setOpenUserId] = useState<string | null>(null)

  const isOwner = roleMap[myUserId] === 'owner'

  return (
    <div style={{ display: 'flex' }}>
      {/* 온라인 참여자 아바타 목록(본인 제외) */}
      {onlineUsers.map((user) => {
        const canManage = isOwner && user.userId !== myUserId
        return (
          <div key={user.userId} style={{ position: 'relative', marginLeft: -8 }}>
            <div
              title={user.nickname}
              onClick={() => canManage && setOpenUserId(openUserId === user.userId ? null : user.userId)}
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: user.avatarColor,
                border: `2px solid ${ROLE_COLORS[roleMap[user.userId] ?? 'watcher']}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: 12,
                fontWeight: 600,
                cursor: canManage ? 'pointer' : 'default',
              }}
            >
              {user.nickname.slice(0, 1)}
            </div>

            {openUserId === user.userId && (
              <PermissionDropdown
                nickname={user.nickname}
                currentRole={roleMap[user.userId] ?? 'watcher'}
                onChangeRole={(role) => updateRole(boardId, user.userId, role)}
                onKick={() => removeMember(boardId, user.userId)}
                onClose={() => setOpenUserId(null)}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}