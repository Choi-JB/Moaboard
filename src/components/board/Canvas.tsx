import { useEffect } from 'react'
import { useBoardObjectsStore } from '../../stores/useBoardObjectsStore'
import { listActiveObjects, createObject } from '../../lib/api/boardObjects'
import type { Board } from '../../types/board'

import { MemoObject } from './CanvasObject/MemoObject'
import { ImageObject } from './CanvasObject/ImageObject'
import type { BoardObject, BoardObjectType, MemoData, ImageData } from '../../types/boardObject'
import type { RealtimeChannel } from '@supabase/supabase-js'
import type { ObjectFilter } from './ObjectListDrawer/ObjectFilterTabs'

const CANVAS_PIXELS: Record<Board['canvas_size'], { width: number; height: number }> = {
    fhd: { width: 1920, height: 1080 },
    qhd: { width: 2560, height: 1440 },
    uhd: { width: 3840, height: 2160 },
}

interface CanvasProps {
    board: Board
    userId: string
    nickname: string
    creationMode: BoardObjectType | null
    onObjectCreated: () => void
    channel: RealtimeChannel | null
    objectFilter: ObjectFilter
    canEdit: boolean
}

export function Canvas({ board, userId, nickname, creationMode, onObjectCreated, channel, objectFilter, canEdit }: CanvasProps) {
    //selector로 구독
    const objects = useBoardObjectsStore((s) => s.objects)
    const setObjects = useBoardObjectsStore((s) => s.setObjects)
    const addObject = useBoardObjectsStore((s) => s.addObject)

    useEffect(() => {
        listActiveObjects(board.id).then(setObjects)
    }, [board.id, setObjects])

    const { width, height } = CANVAS_PIXELS[board.canvas_size]

    //캔버스 클릭 시 메모 또는 이미지 생성
    async function handleCanvasClick(e: React.MouseEvent<HTMLDivElement>) {
        if (!canEdit) return
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

    //객체 리스트에서 객체 선택 시 다른건 뿌옇게 보이게
    function isDimmed(object: BoardObject) {  
        const isMine = object.created_by === userId
        if (objectFilter === 'mine') return !isMine
        if (objectFilter === 'others') return isMine
        return false
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
                    <MemoObject key={object.id} object={object as BoardObject & { data: MemoData }} channel={channel} userId={userId} nickname={nickname} dimmed={isDimmed(object)} canEdit={canEdit} />
                ) : (
                    <ImageObject key={object.id} object={object as BoardObject & { data: ImageData }} channel={channel} userId={userId} nickname={nickname} dimmed={isDimmed(object)} canEdit={canEdit} />
                ),
            )}

        </div>
    )
}