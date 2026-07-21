/** 유저 관련 API */
import { supabase } from '../supabaseClient'

/** 유저 닉네임 조회 */
export async function getUserNickname(userId: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('USER')
    .select('nick')
    .eq('id', userId)
    .maybeSingle()

  if (error) throw error
  return data?.nick ?? null
}