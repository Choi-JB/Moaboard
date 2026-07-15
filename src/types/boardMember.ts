export type BoardRole = 'owner' | 'guest' | 'watcher'

export interface BoardMember {
  id: string
  board_id: string
  user_id: string
  role: BoardRole
  joined_at: string
}
