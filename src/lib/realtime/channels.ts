//채널 생성 함수만 분리해두는 얇은 유틸
import { supabase } from '../supabaseClient'

export function getBoardChannel(boardId: string, userId: string) {
  return supabase.channel(`board-${boardId}`, {
    config: { presence: { key: userId } },
  })
}