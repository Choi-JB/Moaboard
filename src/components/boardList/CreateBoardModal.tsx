import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { createBoard } from '../../lib/api/boards'
import type { CanvasSize } from '../../types/board'

const CANVAS_SIZES: { value: CanvasSize; label: string; resolution: string }[] = [
  { value: 'fhd', label: 'FHD', resolution: '1920×1080' },
  { value: 'qhd', label: 'QHD', resolution: '2560×1440' },
  { value: 'uhd', label: 'UHD', resolution: '3840×2160' },
]

const BACKGROUND_COLORS = ['#FFFFFF', '#FDE68A', '#BFDBFE', '#FBCFE8']

interface CreateBoardModalProps {
  ownerId: string
  onClose: () => void
}

export function CreateBoardModal({ ownerId, onClose }: CreateBoardModalProps) {
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [canvasSize, setCanvasSize] = useState<CanvasSize>('fhd')
  const [backgroundColor, setBackgroundColor] = useState(BACKGROUND_COLORS[0])
  const [submitting, setSubmitting] = useState(false)

  async function handleCreate() {
    setSubmitting(true)
    try {
      const board = await createBoard(
        { title, canvas_size: canvasSize, background_color: backgroundColor },
        ownerId,
      )
      navigate(`/board/${board.id}`)
    } catch (err) {
      setSubmitting(false)
      alert(`보드 생성에 실패했습니다: ${(err as Error).message}`)
    }
  }

  return (
    <Modal title="새 보드 만들기" onClose={onClose}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          보드 이름
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="예: 여행 브레인스토밍"
            style={{
              padding: '8px 10px',
              borderRadius: 6,
              border: '1px solid var(--color-border)',
              background: 'var(--color-bg)',
              color: 'var(--color-text)',
            }}
          />
        </label>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          캔버스 크기
          <div style={{ display: 'flex', gap: 8 }}>
            {CANVAS_SIZES.map((size) => (
              <button
                key={size.value}
                onClick={() => setCanvasSize(size.value)}
                style={{
                  flex: 1,
                  padding: '8px 4px',
                  borderRadius: 6,
                  cursor: 'pointer',
                  fontSize: 12,
                  border:
                    canvasSize === size.value
                      ? '2px solid var(--color-accent)'
                      : '1px solid var(--color-border)',
                  background: 'transparent',
                  color: 'var(--color-text)',
                }}
              >
                <div style={{ fontWeight: 600 }}>{size.label}</div>
                <div style={{ color: 'var(--color-text-muted)' }}>{size.resolution}</div>
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          배경색
          <div style={{ display: 'flex', gap: 8 }}>
            {BACKGROUND_COLORS.map((color) => (
              <button
                key={color}
                onClick={() => setBackgroundColor(color)}
                aria-label={color}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  background: color,
                  cursor: 'pointer',
                  border:
                    backgroundColor === color
                      ? '2px solid var(--color-accent)'
                      : '1px solid var(--color-border)',
                }}
              />
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
          <Button variant="secondary" onClick={onClose}>
            취소
          </Button>
          <Button variant="primary" onClick={handleCreate} disabled={submitting}>
            {submitting ? '만드는 중...' : '만들기'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
