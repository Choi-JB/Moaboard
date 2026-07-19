/** 현재 접속 중인 사람 목록을 관리하는 스토어 */
import { create } from 'zustand'

//role을 넣으면 위조 가능이 있어 role은 DB에서만 조회가능하게 함
export interface PresenceUser {
  userId: string
  nickname: string
  avatarColor: string
}

interface PresenceState {
  onlineUsers: PresenceUser[]
  setOnlineUsers: (users: PresenceUser[]) => void
}

export const usePresenceStore = create<PresenceState>((set) => ({
  onlineUsers: [],
  setOnlineUsers: (users) => set({ onlineUsers: users }),
}))