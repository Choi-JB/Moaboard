//객체를 편집, 이동 중에는 다른사람이 편집 할수 없게 잠금 처리
import { create } from 'zustand'

export type SoftLockAction = 'dragging' | 'editing'

export interface SoftLockInfo {
    userId: string
    nickname: string
    action: SoftLockAction
    lastSeen: number
}

interface SoftLockState {
    locks: Record<string, SoftLockInfo>
    setLock: (objectId: string, info: Omit<SoftLockInfo, 'lastSeen'>) => void
    bumpLockHeartbeat: (objectId: string) => void
    clearLock: (objectId: string) => void
    purgeStale: (timeoutMs: number) => void
}

export const useSoftLockStore = create<SoftLockState>((set) => ({
    locks: {},

    //잠금 설정
    setLock: (objectId, info) =>
        set((state) => ({
            locks: { ...state.locks, [objectId]: { ...info, lastSeen: Date.now() } },
        })),

    // 드래그 중엔 position broadcast가 올 때마다 호출 — 이미 잠긴 객체의 생존 신호만 갱신
    bumpLockHeartbeat: (objectId) =>
        set((state) => {
            const existing = state.locks[objectId]
            if (!existing) return state
            return { locks: { ...state.locks, [objectId]: { ...existing, lastSeen: Date.now() } } }
        }),

    //잠금 해제
    clearLock: (objectId) =>
        set((state) => {
            const next = { ...state.locks }
            delete next[objectId]
            return { locks: next }
        }),

    // 8초 이상 신호 없는 잠금 자동 해제 (엣지 케이스: 종료 신호 유실 대응)
    purgeStale: (timeoutMs) =>
        set((state) => {
            const now = Date.now()
            const next: Record<string, SoftLockInfo> = {}
            for (const [id, info] of Object.entries(state.locks)) {
                if (now - info.lastSeen < timeoutMs) next[id] = info
            }
            return { locks: next }
        }),
}))