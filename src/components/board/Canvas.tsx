import { useEffect } from 'react'
import { useBoardObjectsStore } from '../../stores/useBoardObjectsStore'
import { listActiveObjects, createObject } from '../../lib/api/boardObjects'
import type { Board } from '../../types/board'

import { MemoObject } from './CanvasObject/MemoObject'
import { ImageObject } from './CanvasObject/ImageObject'
import type { BoardObject, BoardObjectType, MemoData, ImageData } from '../../types/boardObject'


const CANVAS_PIXELS: Record<Board['canvas_size'], { width: number; height: number }> = {
    fhd: { width: 1920, height: 1080 },
    qhd: { width: 2560, height: 1440 },
    uhd: { width: 3840, height: 2160 },
}

interface CanvasProps {
    board: Board
    userId: string
    creationMode: BoardObjectType | null
    onObjectCreated: () => void
}

export function Canvas({ board, userId, creationMode, onObjectCreated }: CanvasProps) {
    //selector로 구독
    const objects = useBoardObjectsStore((s) => s.objects)
    const setObjects = useBoardObjectsStore((s) => s.setObjects)
    const addObject = useBoardObjectsStore((s) => s.addObject)

    useEffect(() => {
        listActiveObjects(board.id).then(setObjects)
    }, [board.id, setObjects])

    const { width, height } = CANVAS_PIXELS[board.canvas_size]

    async function handleCanvasClick(e: React.MouseEvent<HTMLDivElement>) {
        if (!creationMode) return
        if (e.target !== e.currentTarget) return

        const rect = e.currentTarget.getBoundingClientRect()
        const posX = e.clientX - rect.left
        const posY = e.clientY - rect.top

        if( creationMode === 'memo') {
            const created = await createObject({
                boardId: board.id,
                type: 'memo',
                posX,
                posY,
                width: 200,
                height: 200,
                data: { content: '', color: '#FFEB3B' },
                createdBy: userId,
            })
            addObject(created)
        } 
        else if (creationMode === 'image') {
            const url = window.prompt('이미지 URL을 입력하세요')
            if (!url) return
            const created = await createObject({
                boardId: board.id,
                type: 'image',
                posX,
                posY,
                width: 200,
                height: 200,
                data: { url },
                createdBy: userId,
            })
            addObject(created)
        }
        onObjectCreated()
    }
    
    return (
        <div
            onClick={handleCanvasClick}
            style={{
                position: 'relative',
                width,
                height,
                background: board.background_color,
                overflow: 'auto',
            }}
        >
            
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