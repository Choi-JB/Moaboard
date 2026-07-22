/** 보드 오브젝트 목록을 관리하는 스토어 */
import { create } from 'zustand'
import type { BoardObject } from '../types/boardObject'

interface BoardObjectsState {
    objects: BoardObject[]  // 보드 오브젝트 목록
    selectedObjectId: string | null  // 선택된 오브젝트 ID
    setObjects: (objects: BoardObject[]) => void  // 보드 오브젝트 목록 설정
    addObject: (object: BoardObject) => void  // 오브젝트 추가
    updateObjectPosition: (id: string, posX: number, posY: number) => void  // 오브젝트 위치 업데이트
    updateObjectData: (id: string, data: BoardObject['data']) => void  // 오브젝트 데이터 업데이트
    removeObject: (id: string) => void  // 오브젝트 삭제
    setSelectedObjectId: (id: string | null) => void  // 선택된 오브젝트 ID 설정
}

export const useBoardObjectsStore = create<BoardObjectsState>((set) => ({
    objects: [],
    selectedObjectId: null,
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
    setSelectedObjectId: (id) => set({ selectedObjectId: id }),
}))