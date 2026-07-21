/** 보드 객체 관련 API */
import { supabase } from '../supabaseClient'
import type { BoardObject, BoardObjectType } from '../../types/boardObject'

const TABLE = 'BOARD_OBJECTS'

/** 보드 활성 객체 목록 조회 */
export async function listActiveObjects(boardId: string): Promise<BoardObject[]> {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('board_id', boardId)
    .is('deleted_at', null)

  if (error) throw error
  return data as BoardObject[]
}

/** 보드 객체 생성 */
export async function createObject(input: {
  boardId: string
  type: BoardObjectType
  posX: number
  posY: number
  width: number
  height: number
  data: BoardObject['data']
  createdBy: string
}): Promise<BoardObject> {
  const { data, error } = await supabase
    .from(TABLE)
    .insert({
      board_id: input.boardId,
      type: input.type,
      pos_x: input.posX,
      pos_y: input.posY,
      width: input.width,
      height: input.height,
      data: input.data,
      created_by: input.createdBy,
    })
    .select('*')
    .single()

  if (error) throw error
  return data as BoardObject
}

/** 드래그 종료(mouseup) 시점 1회 호출 */
export async function updatePosition(
  objectId: string,
  posX: number,
  posY: number,
): Promise<void> {
  const { error } = await supabase
    .from(TABLE)
    .update({ pos_x: posX, pos_y: posY })
    .eq('id', objectId)

  if (error) throw error
}

/** 보드 객체 데이터 업데이트 */
export async function updateObjectData(
  objectId: string,
  data: BoardObject['data'],
): Promise<void> {
  const { error } = await supabase.from(TABLE).update({ data }).eq('id', objectId)

  if (error) throw error
}

/** 보드 객체 잠금 상태 설정 */
export async function setLocked(objectId: string, isLocked: boolean): Promise<void> {
  const { error } = await supabase
    .from(TABLE)
    .update({ is_locked: isLocked })
    .eq('id', objectId)

  if (error) throw error
}

/** 실제 삭제가 아닌 휴지통 이동(deleted_at 기록). 완전 삭제는 pg_cron이 처리. */
export async function softDeleteObject(objectId: string): Promise<void> {
  const { error } = await supabase
    .from(TABLE)
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', objectId)

  if (error) throw error
}
