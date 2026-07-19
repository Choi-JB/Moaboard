import { useRef } from 'react'
import { useBoardObjectsStore } from '../../../stores/useBoardObjectsStore'
import { useAutoSave } from '../../../hooks/useAutoSave'
import type { BoardObject, ImageData } from '../../../types/boardObject'
import type { RealtimeChannel } from '@supabase/supabase-js'

interface ImageObjectProps {
    object: BoardObject & { data: ImageData }
    channel: RealtimeChannel | null
}

export function ImageObject({ object, channel }: ImageObjectProps) {
    const updateObjectPosition = useBoardObjectsStore((s) => s.updateObjectPosition)
    const { commitPosition, deleteObject } = useAutoSave()
    const dragStart = useRef<{ pointerX: number; pointerY: number; posX: number; posY: number } | null>(null)
    const lastSentRef = useRef(0)

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
        const x = dragStart.current.posX + dx
        const y = dragStart.current.posY + dy
        updateObjectPosition(object.id, x, y)

        const now = Date.now()
        if (channel && now - lastSentRef.current > 100) {
            lastSentRef.current = now
            channel.send({ type: 'broadcast', event: 'position', payload: { objectId: object.id, x, y } })
        }
    }

    //드래그 종료
    function handlePointerUp(e: React.PointerEvent) {
        if (!dragStart.current) return
        const dx = e.clientX - dragStart.current.pointerX
        const dy = e.clientY - dragStart.current.pointerY
        const finalX = dragStart.current.posX + dx
        const finalY = dragStart.current.posY + dy
        dragStart.current = null
        commitPosition(object.id, finalX, finalY)
    }

    return (
        <div style={{ position: 'absolute', left: object.pos_x, top: object.pos_y }}>
            <button
                onClick={() => deleteObject(object.id)}
                style={{
                    position: 'absolute',
                    top: -8,
                    right: -8,
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    border: 'none',
                    background: '#00000099',
                    color: '#fff',
                    fontSize: 12,
                    lineHeight: '20px',
                    cursor: 'pointer',
                    zIndex: 1,
                }}
            >
                ✕
            </button>
            <img
                src={object.data.url}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                style={{
                    width: object.width,
                    height: object.height,
                    cursor: 'grab',
                    objectFit: 'cover',
                    borderRadius: 4,
                }}
                draggable={false}
            />
        </div>
    )
}