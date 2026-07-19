import { useRef } from 'react'
import { useBoardObjectsStore } from '../../../stores/useBoardObjectsStore'
import { useAutoSave } from '../../../hooks/useAutoSave'
import type { BoardObject, MemoData } from '../../../types/boardObject'
import type { RealtimeChannel } from '@supabase/supabase-js'


interface MemoObjectProps {
    object: BoardObject & { data: MemoData }
    channel: RealtimeChannel | null
}


export function MemoObject({ object, channel }: MemoObjectProps) {
    const{ commitPosition, commitMemoData, deleteObject } = useAutoSave()
    const updateObjectPosition = useBoardObjectsStore((s) => s.updateObjectPosition)
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

        //브로드캐스트 전송 (100ms마다 한 번) - 드래그 중 위치 동기화
        const now = Date.now()
        if (channel && now - lastSentRef.current > 100) {
            lastSentRef.current = now
            channel.send({ type: 'broadcast', event: 'position', payload: { objectId: object.id, x, y } })
        }
    }

    //드래그 종료
    function handlePointerUp(e: React.PointerEvent) {
        if (!dragStart.current) return

        //최종 좌표 계산
        const dx = e.clientX - dragStart.current.pointerX
        const dy = e.clientY - dragStart.current.pointerY
        const finalX = dragStart.current.posX + dx
        const finalY = dragStart.current.posY + dy
        
        dragStart.current = null
        commitPosition(object.id, finalX, finalY)
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
             <button
                onClick={() => deleteObject(object.id)}
                onPointerDown={(e) => e.stopPropagation()}
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
                }}
            >
                X
            </button>
            <textarea
                value={object.data.content}
                onChange={(e) => commitMemoData(object.id, { ...object.data, content: e.target.value })}
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