/** 보드 오브젝트 목록을 관리하는 스토어 */
import { create } from 'zustand'
import type { BoardObject } from '../types/boardObject'

interface BoardObjectsState {
    objects: BoardObject[]
    setObjects: (objects: BoardObject[]) => void
    addObject: (object: BoardObject) => void
    updateObjectPosition: (id: string, posX: number, posY: number) => void
    updateObjectData: (id: string, data: BoardObject['data']) => void
    removeObject: (id: string) => void
}

export const useBoardObjectsStore = create<BoardObjectsState>((set) => ({
    objects: [],
    setObjects: (objects) => set({ objects }),
    addObject: (object) => set((state) => ({ objects: [...state.objects, object] })),
    updateObjectPosition: (id, posX, posY) =>
        set((state) => ({
            objects: state.objects.map((o) =>
                o.id === id ? { ...o, pos_x: posX, pos_y: posY } : o,
            ),
        })),
    updateObjectData: (id, data) =>
        set((state) => ({
            objects: state.objects.map((o) => (o.id === id ? { ...o, data } : o)),
        })),
    removeObject: (id) =>
        set((state) => ({ objects: state.objects.filter((o) => o.id !== id) })),
}))