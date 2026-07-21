/** 보드 관련 API */
import { supabase } from '../supabaseClient'
import type { Board, BoardInsert, BoardUpdate } from '../../types/board'
import type { BoardRole } from '../../types/boardMember'

const TABLE = 'BOARD'

export interface BoardWithRole extends Board {
  role: BoardRole
}

/** 현재 유저가 guest 이상 권한(owner/guest)을 가진 보드만 조회. watcher로만 참여한 보드는 제외. */
export async function listMyBoards(userId: string): Promise<BoardWithRole[]> {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*, BOARD_MEMBER!inner(role, user_id)')
    .eq('BOARD_MEMBER.user_id', userId)
    .in('BOARD_MEMBER.role', ['owner', 'guest'])
    .is('deleted_at', null)
    .order('updated_at', { ascending: false })

  if (error) throw error

  type Row = Board & { BOARD_MEMBER: { role: BoardRole; user_id: string }[] }
  return (data as Row[]).map(({ BOARD_MEMBER, ...board }) => ({
    ...board,
    role: BOARD_MEMBER[0].role,
  }))
}

/** 보드 정보 조회 */
export async function getBoardById(boardId: string): Promise<Board> {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('id', boardId)
    .is('deleted_at', null)
    .maybeSingle()

  if (error) throw error
  return data as Board
}

/** 보드 생성 + 생성자를 owner로 board_member에 등록까지 한 번에 처리 */
export async function createBoard(
  input: BoardInsert,
  ownerId: string,
): Promise<Board> {
  const { data: board, error: boardError } = await supabase
    .from(TABLE)
    .insert({
      title: input.title?.trim() || '제목 없는 보드',
      canvas_size: input.canvas_size,
      background_color: input.background_color,
      theme: input.theme ?? null,
      owner_id: ownerId,
      invite_token: crypto.randomUUID(),
    })
    .select('*')
    .single()

  if (boardError) throw boardError

  const { error: memberError } = await supabase.from('BOARD_MEMBER').insert({
    board_id: board.id,
    user_id: ownerId,
    role: 'owner',
  })

  if (memberError) throw memberError

  return board as Board
}

/** 보드 정보 업데이트 */
export async function updateBoard(
  boardId: string,
  patch: BoardUpdate,
): Promise<Board> {
  const { data, error } = await supabase
    .from(TABLE)
    .update(patch)
    .eq('id', boardId)
    .select('*')
    .single()

  if (error) throw error
  return data as Board
}

/** 보드 삭제 */
export async function deleteBoard(boardId: string): Promise<void> {
  const { error } = await supabase
    .from(TABLE)
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', boardId)

  if (error) throw error
}

/** 보드 초대 토큰 생성 */
export async function getBoardByInviteToken(token: string): Promise<Board | null> {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('invite_token', token)
    .is('deleted_at', null)
    .maybeSingle()

  if (error) throw error
  return data as Board | null
}

/** 보드 멤버 수 조회 */
export async function getBoardMemberCount(boardId: string): Promise<number> {
  const { data, error } = await supabase.rpc('get_board_member_count', { p_board_id: boardId })
  if (error) throw error
  return data as number
}