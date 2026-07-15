import { useEffect } from 'react'
import { useBoardObjectsStore } from '../../stores/useBoardObjectsStore'
import { listActiveObjects } from '../../lib/api/boardObjects'
import type { Board } from '../../types/board'

import { MemoObject } from './CanvasObject/MemoObject'
import { ImageObject } from './CanvasObject/ImageObject'
import type { BoardObject, MemoData, ImageData } from '../../types/boardObject'

import type { BoardObjectType } from '../../types/boardObject'

const CANVAS_PIXELS: Record<Board['canvas_size'], { width: number; height: number }> = {
    fhd: { width: 1920, height: 1080 },
    qhd: { width: 2560, height: 1440 },
    uhd: { width: 3840, height: 2160 },
}

interface CanvasProps {
    board: Board

}

export function Canvas({ board }: CanvasProps) {
    //selector로 구독
    const objects = useBoardObjectsStore((s) => s.objects)
    const setObjects = useBoardObjectsStore((s) => s.setObjects)

    useEffect(() => {
        listActiveObjects(board.id).then(setObjects)
    }, [board.id, setObjects])

    const { width, height } = CANVAS_PIXELS[board.canvas_size]

    return (
        <div
            style={{
                position: 'relative',
                width,
                height,
                background: board.background_color,
                overflow: 'auto',
            }}
        >
            {/* {objects.map((object) => (
                <div
                    key={object.id}
                    style={{
                        position: 'absolute',
                        left: object.pos_x,
                        top: object.pos_y,
                        width: object.width,
                        height: object.height,
                        border: '1px solid #ccc',
                        background: '#fff',
                        fontSize: 12,
                        padding: 4,
                        overflow: 'hidden',
                    }}
                >
                    {object.type} #{object.id.slice(0, 4)}
                </div>
            ))} */}
            {objects.map((object) =>
                object.type === 'memo' ? (
                    <MemoObject key={object.id} object={object as BoardObject & { data: MemoData }} />
                ) : (
                    <ImageObject key={object.id} object={object as BoardObject & { data: ImageData }} />
                ),
            )}

        </div>
    )
}