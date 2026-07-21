/** 보드 멤버 관련 API */
import { supabase } from '../supabaseClient'
import type { BoardMember, BoardRole } from '../../types/boardMember'

const TABLE = 'BOARD_MEMBER'

/** 보드 멤버 목록 조회 */
export async function listMembers(boardId: string): Promise<BoardMember[]> {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('board_id', boardId)

  if (error) throw error
  return data as BoardMember[]
}

/** 보드 멤버 역할 조회 */
export async function getMyRole(
  boardId: string,
  userId: string,
): Promise<BoardRole | null> {
  const { data, error } = await supabase
    .from(TABLE)
    .select('role')
    .eq('board_id', boardId)
    .eq('user_id', userId)
    .maybeSingle()

  if (error) throw error
  return (data?.role as BoardRole) ?? null
}

/** 초대 링크 접속 시 본인을 watcher로 등록 (이미 등록된 경우 기존 role 유지) */
export async function joinAsWatcher(
  boardId: string,
  userId: string,
): Promise<void> {
  const { error } = await supabase.from(TABLE).upsert(
    { board_id: boardId, user_id: userId, role: 'watcher' },
    { onConflict: 'board_id,user_id', ignoreDuplicates: true },
  )

  if (error) throw error
}

/** owner 전용. RLS가 owner 여부를 강제 검증한다. */
export async function updateRole(
  boardId: string,
  userId: string,
  role: BoardRole,
): Promise<void> {
  const { error } = await supabase
    .from(TABLE)
    .update({ role })
    .eq('board_id', boardId)
    .eq('user_id', userId)

  if (error) throw error
}

/** 보드 목록 카드에 표시할 참여자 수를 board_id별로 집계 */
export async function getMemberCounts(
  boardIds: string[],
): Promise<Record<string, number>> {
  if (boardIds.length === 0) return {}

  const { data, error } = await supabase
    .from(TABLE)
    .select('board_id')
    .in('board_id', boardIds)

  if (error) throw error

  const counts: Record<string, number> = {}
  for (const row of data as { board_id: string }[]) {
    counts[row.board_id] = (counts[row.board_id] ?? 0) + 1
  }
  return counts
}

/** 보드 멤버 제거(강퇴) */
export async function removeMember(
  boardId: string,
  userId: string,
): Promise<void> {
  const { error } = await supabase
    .from(TABLE)
    .delete()
    .eq('board_id', boardId)
    .eq('user_id', userId)

  if (error) throw error
}
