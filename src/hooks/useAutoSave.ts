import { useRef } from 'react'
import { useBoardObjectsStore } from '../stores/useBoardObjectsStore'
import { updatePosition, updateObjectData, softDeleteObject } from '../lib/api/boardObjects'
import type { BoardObject } from '../types/boardObject'

export function useAutoSave() {
    const updateObjectDataLocal = useBoardObjectsStore((s) => s.updateObjectData)
    const removeObject = useBoardObjectsStore((s) => s.removeObject)
    const debounceTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({})

    // 드래그 종료 시 1회 호출 (즉시 저장)
    function commitPosition(id: string, posX: number, posY: number) {
        updatePosition(id, posX, posY).catch((err) => console.error('위치 저장 실패', err))
    }

    // 타이핑 중 호출: 화면(스토어)엔 즉시 반영, DB 저장은 500ms 디바운스
    function commitMemoData(id: string, data: BoardObject['data']) {
        updateObjectDataLocal(id, data)

        if (debounceTimers.current[id]) clearTimeout(debounceTimers.current[id])
        debounceTimers.current[id] = setTimeout(() => {
            updateObjectData(id, data).catch((err) => console.error('내용 저장 실패', err))
        }, 500)
    }

    // 삭제: 즉시 처리 (deleted_at 기록 후 화면에서 제거)
    async function deleteObject(id: string) {
        await softDeleteObject(id)
        removeObject(id)
    }

    return { commitPosition, commitMemoData, deleteObject }
}