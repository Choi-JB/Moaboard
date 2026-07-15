import { useRef } from 'react'
import { useBoardObjectsStore } from '../../../stores/useBoardObjectsStore'
import type { BoardObject, MemoData } from '../../../types/boardObject'

interface MemoObjectProps {
    object: BoardObject & { data: MemoData }
}

export function MemoObject({ object }: MemoObjectProps) {
    const updateObjectPosition = useBoardObjectsStore((s) => s.updateObjectPosition)
    const dragStart = useRef<{ pointerX: number; pointerY: number; posX: number; posY: number } | null>(null)

    //드래그 시작
    function handlePointerDown(e: React.PointerEvent) {
        e.currentTarget.setPointerCapture(e.pointerId)
        dragStart.current = {
            pointerX: e.clientX,
            pointerY: e.clientY,
            posX: object.pos_x,
            posY: object.pos_y,
        }
    }

    //드래그 중 (포인터 이동)
    function handlePointerMove(e: React.PointerEvent) {
        if (!dragStart.current) return
        const dx = e.clientX - dragStart.current.pointerX
        const dy = e.clientY - dragStart.current.pointerY
        updateObjectPosition(object.id, dragStart.current.posX + dx, dragStart.current.posY + dy)
    }

    //드래그 종료
    function handlePointerUp() {
        dragStart.current = null
        // 6번 단계(useAutoSave)에서 여기에 DB 저장 호출을 붙일 예정
    }

    return (
        <div
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            style={{
                position: 'absolute',
                left: object.pos_x,
                top: object.pos_y,
                width: object.width,
                height: object.height,
                background: object.data.color,
                padding: 8,
                cursor: 'grab',
                boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                borderRadius: 4,
            }}
        >
            <textarea
                defaultValue={object.data.content}
                onPointerDown={(e) => e.stopPropagation()}
                style={{
                    width: '100%',
                    height: '100%',
                    border: 'none',
                    background: 'transparent',
                    resize: 'none',
                }}
            />
        </div>
    )
}