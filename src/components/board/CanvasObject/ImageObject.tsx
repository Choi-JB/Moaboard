import { useRef } from 'react'
import { useBoardObjectsStore } from '../../../stores/useBoardObjectsStore'
import type { BoardObject, ImageData } from '../../../types/boardObject'

interface ImageObjectProps {
    object: BoardObject & { data: ImageData }
}

export function ImageObject({ object }: ImageObjectProps) {
    const updateObjectPosition = useBoardObjectsStore((s) => s.updateObjectPosition)
    const dragStart = useRef<{ pointerX: number; pointerY: number; posX: number; posY: number } | null>(null)

    function handlePointerDown(e: React.PointerEvent) {
        e.currentTarget.setPointerCapture(e.pointerId)
        dragStart.current = {
            pointerX: e.clientX,
            pointerY: e.clientY,
            posX: object.pos_x,
            posY: object.pos_y,
        }
    }

    function handlePointerMove(e: React.PointerEvent) {
        if (!dragStart.current) return
        const dx = e.clientX - dragStart.current.pointerX
        const dy = e.clientY - dragStart.current.pointerY
        updateObjectPosition(object.id, dragStart.current.posX + dx, dragStart.current.posY + dy)
    }

    function handlePointerUp() {
        dragStart.current = null
    }

    return (
        <img
            src={object.data.url}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            style={{
                position: 'absolute',
                left: object.pos_x,
                top: object.pos_y,
                width: object.width,
                height: object.height,
                cursor: 'grab',
                objectFit: 'cover',
                borderRadius: 4,
            }}
            draggable={false}
        />
    )
}