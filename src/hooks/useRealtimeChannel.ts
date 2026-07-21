import { useEffect, useState, useRef } from 'react'
import { RealtimeChannel } from '@supabase/supabase-js'
import { supabase } from '../lib/supabaseClient'
import { getBoardChannel } from '../lib/realtime/channels'
import { useBoardObjectsStore } from '../stores/useBoardObjectsStore'
import {listActiveObjects} from '../lib/api/boardObjects'
import type { BoardObject } from '../types/boardObject'
import type { BoardRole } from '../types/boardMember'

import { usePresenceStore } from '../stores/usePresenceStore'
import {getAvatarColor} from '../lib/realtime/avatarColor'
import { useSoftLockStore } from '../stores/useSoftLockStore'

//해당 시간 경과시 편집 종료 알림
const LOCK_TIMEOUT_MS = 8000

export type MemberChangeEvent = 
| { type: 'upsert'; userId: string; role: BoardRole }
| { type: 'removed'; userId: string }

export function useRealtimeChannel(
  boardId: string, 
  userId: string, 
  nickname: string, 
  onReconnect?: () => void,
  onMemberChange?: (event: MemberChangeEvent) => void
) {
  const [channel, setChannel] = useState<RealtimeChannel | null>(null)
  const addObject = useBoardObjectsStore((s) => s.addObject)
  const setObjects = useBoardObjectsStore((s) => s.setObjects)
  const updateObjectPosition = useBoardObjectsStore((s) => s.updateObjectPosition)
  const updateObjectData = useBoardObjectsStore((s) => s.updateObjectData)
  const removeObject = useBoardObjectsStore((s) => s.removeObject)
  const setOnlineUsers = usePresenceStore((s) => s.setOnlineUsers)

  const setLock = useSoftLockStore((s) => s.setLock)
  const clearLock = useSoftLockStore((s) => s.clearLock)
  const bumpLockHeartbeat = useSoftLockStore((s) => s.bumpLockHeartbeat)
  const purgeStale = useSoftLockStore((s) => s.purgeStale)

  //onReconnect가 매 렌더마다 새 함수여도 채널을 다시 구독하지 않도록 ref로 최신값만 참조
  const onReconnectRef = useRef(onReconnect)
  onReconnectRef.current = onReconnect
  const onMemberChangeRef = useRef(onMemberChange)
  onMemberChangeRef.current = onMemberChange


  useEffect(() => {
    if (!boardId || !userId) return
    const channel = getBoardChannel(boardId, userId)
    let hasConnectedOnce = false

    //데이터베이스 변경 수신 (오브젝트 생성, 수정, 삭제 등) 변경 사항을 자동으로 수신
    channel.on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'BOARD_OBJECTS', filter: `board_id=eq.${boardId}` },
      (payload) => {
        if (payload.eventType === 'INSERT') {
          addObject(payload.new as BoardObject)
        } else if (payload.eventType === 'UPDATE') {
          const row = payload.new as BoardObject
          if(row.deleted_at) {
            removeObject(row.id)
          } else {  
            updateObjectPosition(row.id, row.pos_x, row.pos_y)
            updateObjectData(row.id, row.data)
          }
        } else if (payload.eventType === 'DELETE') {
          removeObject((payload.old as BoardObject).id)
        }
      },
    )

    //참여자 role 변경/강퇴 수신
    channel.on('postgres_changes',
      { event: '*', schema: 'public', table: 'BOARD_MEMBER', filter: `board_id=eq.${boardId}` },
      (payload) => {
        if (payload.eventType === 'DELETE') {
          const old = payload.old as { user_id: string }
          onMemberChangeRef.current?.({ type: 'removed', userId: old.user_id })
        } else {
          const row = payload.new as { user_id: string; role: BoardRole }
          onMemberChangeRef.current?.({ type: 'upsert', userId: row.user_id, role: row.role })
        }
      },
    )

    //오브젝트 드래그 중 위치 수신 (브로드캐스트)   클라이언트->서버->클라이언트 간 수동 메시지 전달 방식
    channel.on('broadcast', { event: 'position' }, ({ payload }) => {
        updateObjectPosition(payload.objectId, payload.x, payload.y)
        bumpLockHeartbeat(payload.objectId) //드래그 중이라는 신호 송신 -> 잠금 상태 갱신
      })
    
    //소프트 락 신호 수신 -> 잠금 설정 또는 해제
    channel.on('broadcast', { event: 'lock' }, ({ payload }) => {
      if (payload.action === 'end') {
        clearLock(payload.objectId) //잠금 해제
      } else {
        setLock(payload.objectId, { //잠금 설정
          userId: payload.userId, //잠금 설정한 유저 ID
          nickname: payload.nickname, //잠금 설정한 유저 닉네임
          action: payload.action, //잠금 상태
        })
      }
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

      //최초 연결 이후 오브젝트 목록 동기화 및 재연결 콜백 호출
      if(hasConnectedOnce){
        listActiveObjects(boardId).then(setObjects)
        onReconnectRef.current?.()
      }

      hasConnectedOnce = true
    })

    setChannel(channel)

    //일정 시간 이상 신호 없는 잠금 객체 자동 해제
    const purgeInterval = setInterval(() => {
      purgeStale(LOCK_TIMEOUT_MS)
    }, 2000)

    return () => {
      clearInterval(purgeInterval)
      supabase.removeChannel(channel)
      setChannel(null)
      setOnlineUsers([])
    }
  }, [boardId, userId, nickname])

  return channel
}