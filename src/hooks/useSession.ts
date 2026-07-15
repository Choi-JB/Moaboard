import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabaseClient'

interface SessionState {
  session: Session | null
  loading: boolean
}

/** 현재 로그인 세션(구글/익명 공통)을 구독해 로그인 여부와 user를 제공한다. */
export function useSession(): SessionState {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 초기 세션 상태를 가져옵니다.
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })

    // 유저의 로그인/로그아웃 상태 변화를 계속 감시(Subscribe)합니다.
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
    })

    // 컴포넌트가 언마운트될 때 구독을 해지합니다.
    return () => subscription.subscription.unsubscribe()
  }, [])

  return { session, loading }
}
