/** 보드 설정 패널 */
import { useState } from 'react'
import { Modal } from '../../ui/Modal'
import { Button } from '../../ui/Button'
import { updateBoard, deleteBoard } from '../../../lib/api/boards'
import { DeleteBoardConfirmModal } from './DeleteBoardConfirmModal'
import type { Board, CanvasSize } from '../../../types/board'

const CANVAS_SIZES: { value: CanvasSize; label: string; resolution: string }[] = [
    { value: 'fhd', label: 'FHD', resolution: '1920×1080' },
    { value: 'qhd', label: 'QHD', resolution: '2560×1440' },
    { value: 'uhd', label: 'UHD', resolution: '3840×2160' },
]

const BACKGROUND_COLORS = ['#FFFFFF', '#FDE68A', '#BFDBFE', '#FBCFE8']

interface SettingsPanelProps {
    board: Board
    onClose: () => void
    onUpdated: (board: Board) => void
    onDeleted: () => void
}

export function SettingsPanel({ board, onClose, onUpdated, onDeleted }: SettingsPanelProps) {
    const [title, setTitle] = useState(board.title)
    const [deleteModalOpen, setDeleteModalOpen] = useState(false)
    const [copied, setCopied] = useState(false)

    const inviteUrl = `${window.location.origin}/invite/${board.invite_token}`

    async function saveTitle() {
        if (title.trim() === board.title) return
        const updated = await updateBoard(board.id, { title: title.trim() || '제목 없는 보드' })
        onUpdated(updated)
    }

    async function changeCanvasSize(canvas_size: CanvasSize) {
        const updated = await updateBoard(board.id, { canvas_size })
        onUpdated(updated)
    }

    async function changeBackgroundColor(background_color: string) {
        const updated = await updateBoard(board.id, { background_color })
        onUpdated(updated)
    }

    async function handleCopyInvite() {
        await navigator.clipboard.writeText(inviteUrl)
        setCopied(true)
        setTimeout(() => setCopied(false), 1500)
    }

    async function handleDeleteConfirm() {
        await deleteBoard(board.id)
        onDeleted()
    }

    return (
        <Modal title="보드 설정" onClose={onClose}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    보드 이름
                    <input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        onBlur={saveTitle}
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
                                onClick={() => changeCanvasSize(size.value)}
                                style={{
                                    flex: 1,
                                    padding: '8px 4px',
                                    borderRadius: 6,
                                    cursor: 'pointer',
                                    fontSize: 12,
                                    border:
                                        board.canvas_size === size.value
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
                    배경
                    <div style={{ display: 'flex', gap: 8 }}>
                        {BACKGROUND_COLORS.map((color) => (
                            <button
                                key={color}
                                onClick={() => changeBackgroundColor(color)}
                                aria-label={color}
                                style={{
                                    width: 28,
                                    height: 28,
                                    borderRadius: '50%',
                                    background: color,
                                    cursor: 'pointer',
                                    border:
                                        board.background_color === color
                                            ? '2px solid var(--color-accent)'
                                            : '1px solid var(--color-border)',
                                }}
                            />
                        ))}
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    초대 링크
                    <div style={{ display: 'flex', gap: 8 }}>
                        <input
                            readOnly
                            value={inviteUrl}
                            onFocus={(e) => e.target.select()}
                            style={{
                                flex: 1,
                                padding: '8px 10px',
                                borderRadius: 6,
                                border: '1px solid var(--color-border)',
                                background: 'var(--color-surface)',
                                color: 'var(--color-text-muted)',
                                fontSize: 12,
                            }}
                        />
                        <Button variant="secondary" onClick={handleCopyInvite}>
                            {copied ? '복사됨' : '복사'}
                        </Button>
                    </div>
                </div>

                <Button
                    variant="secondary"
                    onClick={() => setDeleteModalOpen(true)}
                    style={{ color: 'var(--color-danger)', borderColor: 'var(--color-danger)' }}
                >
                    🗑 보드 삭제
                </Button>
            </div>

            {deleteModalOpen && (
                <DeleteBoardConfirmModal
                    onCancel={() => setDeleteModalOpen(false)}
                    onConfirm={handleDeleteConfirm}
                />
            )}
        </Modal>
    )
}