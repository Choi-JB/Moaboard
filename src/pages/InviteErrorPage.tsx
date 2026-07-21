/** 보드 초대 오류 페이지 (토큰 만료나 삭제된 보드일 경우 보여줌) */
import { Link } from 'react-router-dom'
import { useSession } from '../hooks/useSession'

export function InviteErrorPage() {
    const { session } = useSession()

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
            <div style={{ fontSize: 48 }}>⛔</div>
            <div>
                <h1 style={{ fontSize: 20, margin: '0 0 8px' }}>유효하지 않은 초대 링크예요</h1>
                <p style={{ margin: 0, color: 'var(--color-text-muted)' }}>
                    링크가 잘못되었거나 보드가 삭제되었을 수 있어요
                </p>
            </div>
            <Link
                to={session ? '/boards' : '/'}
                style={{
                    padding: '10px 16px',
                    borderRadius: 8,
                    background: 'var(--color-accent)',
                    color: '#fff',
                    textDecoration: 'none',
                    fontWeight: 600,
                }}
            >
                {session ? '내 보드 목록으로 이동' : '랜딩 화면으로 이동'}
            </Link>
        </div>
    )
}