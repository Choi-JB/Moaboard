/** 404 페이지 */
import { Link } from 'react-router-dom'
import { useSession } from '../hooks/useSession'

export function NotFoundPage() {
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
            <div style={{ fontSize: 48 }}>🧭</div>
            <div>
                <h1 style={{ fontSize: 20, margin: '0 0 8px' }}>페이지를 찾을 수 없어요</h1>
                <p style={{ margin: 0, color: 'var(--color-text-muted)' }}>
                    주소가 잘못되었거나 더 이상 존재하지 않는 페이지예요
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