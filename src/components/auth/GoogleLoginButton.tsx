import { useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { Button } from '../ui/Button'

export function GoogleLoginButton() {
  const [loading, setLoading] = useState(false)

  async function handleClick() {
    setLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/boards` },
    })
    if (error) {
      setLoading(false)
      alert(`구글 로그인에 실패했습니다: ${error.message}`)
    }
  }

  return (
    <Button variant="primary" onClick={handleClick} disabled={loading}>
      {loading ? '이동 중...' : 'G 구글로 계속하기'}
    </Button>
  )
}
