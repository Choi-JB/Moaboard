import { useEffect, useState } from 'react'
import { RealtimeChannel } from '@supabase/supabase-js'
import { supabase } from '../lib/supabaseClient'
import { getBoardChannel } from '../lib/realtime/channels'
import { useBoardObjectsStore } from '../stores/useBoardObjectsStore'
import type { BoardObject } from '../types/boardObject'

import { usePresenceStore } from '../stores/usePresenceStore'
import {getAvatarColor} from '../lib/realtime/avatarColor'

export function useRealtimeChannel(boardId: string, userId: string, nickname: string) {
  const [channel, setChannel] = useState<RealtimeChannel | null>(null)
  const addObject = useBoardObjectsStore((s) => s.addObject)
  const updateObjectPosition = useBoardObjectsStore((s) => s.updateObjectPosition)
  const updateObjectData = useBoardObjectsStore((s) => s.updateObjectData)
  const removeObject = useBoardObjectsStore((s) => s.removeObject)
  const setOnlineUsers = usePresenceStore((s) => s.setOnlineUsers)

  useEffect(() => {
    if (!boardId || !userId) return
    const channel = getBoardChannel(boardId, userId)

    //데이터베이스 변경 수신 (오브젝트 생성, 수정, 삭제 등) 변경 사항을 자동으로 수신
    channel.on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'BOARD_OBJECTS', filter: `board_id=eq.${boardId}` },
      (payload) => {
        if (payload.eventType === 'INSERT') {
          addObject(payload.new as BoardObject)
        } else if (payload.eventType === 'UPDATE') {
          const row = payload.new as BoardObject
          updateObjectPosition(row.id, row.pos_x, row.pos_y)
          updateObjectData(row.id, row.data)
        } else if (payload.eventType === 'DELETE') {
          removeObject((payload.old as BoardObject).id)
        }
      },
    )

    //오브젝트 드래그 중 위치 수신 (브로드캐스트)   클라이언트->서버->클라이언트 간 수동 메시지 전달 방식
    channel.on('broadcast', { event: 'position' }, ({ payload }) => {
        updateObjectPosition(payload.objectId, payload.x, payload.y)
      })
  
    
    //접속자 목록 동기화
    channel.on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState<{ userId: string; nickname: string; avatarColor: string }>()
      setOnlineUsers(Object.values(state).map((presences) => presences[0]))
    })

    channel.subscribe((status)=>{
      if(status === 'SUBSCRIBED'){
        //접속 중인 유저 상태 추적
        channel.track({
          userId,
          nickname,
          avatarColor: getAvatarColor(userId),
        })
      }
    })
    setChannel(channel)

    return () => {
      supabase.removeChannel(channel)
      setChannel(null)
      setOnlineUsers([])
    }
  }, [boardId, userId, nickname])

  return channel
}