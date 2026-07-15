import { Navigate } from 'react-router-dom'
import { useSession } from '../hooks/useSession'
import { GoogleLoginButton } from '../components/auth/GoogleLoginButton'

export function LandingPage() {
  const { session, loading } = useSession()

  if (loading) return null
  if (session) return <Navigate to="/boards" replace />

  return (
    <div
      style={{
        minHeight: '100svh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 24,
        textAlign: 'center',
        padding: 24,
      }}
    >
      <div style={{ fontSize: 48 }}>🗂</div>
      <div>
        <h1 style={{ margin: '0 0 8px', fontSize: 28 }}>함께 만드는 온라인 화이트보드</h1>
        <p style={{ margin: 0, color: 'var(--color-text-muted)' }}>
          메모와 이미지로 아이디어를 자유롭게 정리해보세요
        </p>
      </div>
      <GoogleLoginButton />
      <p style={{ margin: 0, fontSize: 13, color: 'var(--color-text-muted)' }}>
        별도 회원가입 없이 구글 계정으로 바로 시작해요
      </p>
    </div>
  )
}
