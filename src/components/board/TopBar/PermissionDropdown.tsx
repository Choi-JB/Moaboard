/** 참여자 권한 변경 드롭다운 */
import type { BoardRole } from '../../../types/boardMember'

interface PermissionDropdownProps {
    nickname: string    //참여자 닉네임
    currentRole: BoardRole //현재 권한
    onChangeRole: (role: BoardRole) => void
    onKick: () => void //강퇴
    onClose: () => void //닫기
}

export function PermissionDropdown({ nickname, currentRole, onChangeRole, onKick, onClose }: PermissionDropdownProps) {
    return (
        <div
            onClick={(e) => e.stopPropagation()}
            style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: 8,
                width: 180,
                background: 'var(--color-bg)',
                border: '1px solid var(--color-border)',
                borderRadius: 8,
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                overflow: 'hidden',
                zIndex: 10,
            }}
        >
            <div style={{ padding: '10px 12px', fontSize: 13, fontWeight: 600, borderBottom: '1px solid var(--color-border)' }}>
                {nickname}님 권한
            </div>

            {(['guest', 'watcher'] as const).map((role) => (
                <button
                    key={role}
                    onClick={() => {
                        onChangeRole(role)
                        onClose()
                    }}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        width: '100%',
                        padding: '10px 12px',
                        border: 'none',
                        background: 'transparent',
                        cursor: 'pointer',
                        fontSize: 13,
                        textAlign: 'left',
                        color: 'var(--color-text)',
                    }}
                >
                    <span style={{ width: 14 }}>{currentRole === role ? '✓' : ''}</span>
                    {role === 'guest' ? 'guest · 편집 가능' : 'watcher · 읽기 전용'}
                </button>
            ))}

            <button
                onClick={() => {
                    onKick()
                    onClose()
                }}
                style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: 'none',
                    borderTop: '1px solid var(--color-border)',
                    background: 'transparent',
                    cursor: 'pointer',
                    fontSize: 13,
                    textAlign: 'left',
                    color: 'var(--color-danger)',
                }}
            >
                🚫 내보내기
            </button>
        </div>
    )
}