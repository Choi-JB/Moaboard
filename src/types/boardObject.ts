export type BoardObjectType = 'memo' | 'image'

export interface MemoData {
  content: string
  color: string
}

export interface ImageData {
  url: string
}

export interface BoardObject {
  id: string
  board_id: string
  type: BoardObjectType
  pos_x: number
  pos_y: number
  width: number
  height: number
  z_index: number
  data: MemoData | ImageData
  created_by: string
  is_locked: boolean
  created_at: string
  updated_at: string
  deleted_at: string | null
}
