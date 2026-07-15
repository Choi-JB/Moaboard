export type CanvasSize = 'fhd' | 'qhd' | 'uhd'

export interface Board {
  id: string
  title: string
  owner_id: string
  invite_token: string
  canvas_size: CanvasSize
  theme: string | null
  background_color: string
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export type BoardInsert = Pick<Board, 'canvas_size' | 'background_color'> &
  Partial<Pick<Board, 'title' | 'theme'>>

export type BoardUpdate = Partial<
  Pick<Board, 'title' | 'canvas_size' | 'theme' | 'background_color'>
>
