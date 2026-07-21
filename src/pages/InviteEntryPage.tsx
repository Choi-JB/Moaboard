// 보드 초대 입장 페이지
import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSession } from '../hooks/useSession'
import { supabase } from '../lib/supabaseClient'
import { getBoardByInviteToken, getBoardMemberCount } from '../lib/api/boards'
import { getUserNickname } from '../lib/api/users'
import { joinAsWatcher } from '../lib/api/boardMembers'
import { InviteErrorPage } from './InviteErrorPage'
import type { Board } from '../types/board'

export function InviteEntryPage() {
    const { token } = useParams<{ token: string }>()
    const { session } = useSession()
    const navigate = useNavigate()

    const [loading, setLoading] = useState(true)
    const [board, setBoard] = useState<Board | null>(null)
    const [ownerNickname, setOwnerNickname] = useState('알 수 없음')
    const [memberCount, setMemberCount] = useState(0)
    const [entering, setEntering] = useState(false)

    useEffect(() => {
        if (!token) return
        getBoardByInviteToken(token).then(async (found) => {
            setBoard(found)
            if (found) {
                const [nickname, count] = await Promise.all([
                    getUserNickname(found.owner_id),
                    getBoardMemberCount(found.id),
                ])
                setOwnerNickname(nickname ?? '알 수 없음')
                setMemberCount(count)
            }
            setLoading(false)
        })
    }, [token])

    async function handleEnter() {
        if (!board) return
        setEntering(true)

        let currentUserId = session?.user.id
        if (!currentUserId) {
            const { data, error } = await supabase.auth.signInAnonymously()
            if (error || !data.session) {
                alert(`입장에 실패했습니다: ${error?.message ?? '알 수 없는 오류'}`)
                setEntering(false)
                return
            }
            currentUserId = data.session.user.id
        }

        await joinAsWatcher(board.id, currentUserId)
        navigate(`/board/${board.id}`)
    }

    if (loading) return null
    if (!board) return <InviteErrorPage />

    return (
        <div
            style={{
                minHeight: '100svh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 16,
                textAlign: 'center',
                padding: 24,
            }}
        >
            <div style={{ width: 240, height: 100, borderRadius: 12, background: board.background_color }} />
            <div>
                <h1 style={{ fontSize: 20, margin: '0 0 4px' }}>{board.title}</h1>
                <p style={{ margin: 0, color: 'var(--color-text-muted)' }}>
                    {ownerNickname}님이 초대하였습니다
                </p>
                <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--color-text-muted)' }}>
                    {memberCount}명 참여 중
                </p>
            </div>

            <button
                onClick={handleEnter}
                disabled={entering}
                style={{
                    padding: '10px 24px',
                    borderRadius: 8,
                    border: 'none',
                    background: 'var(--color-accent)',
                    color: '#fff',
                    fontWeight: 600,
                    cursor: 'pointer',
                }}
            >
                {entering ? '입장하는 중...' : '보드 입장하기'}
            </button>

            <p style={{ margin: 0, fontSize: 12, color: 'var(--color-text-muted)' }}>
                읽기 전용(watcher)으로 입장해요. 편집하려면 보드 안에서 권한을 요청하세요
            </p>
        </div>
    )
}