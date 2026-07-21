// 보드 삭제 확인 모달
import { useState } from 'react'
import { Modal } from '../../ui/Modal'
import { Button } from '../../ui/Button'

interface DeleteBoardConfirmModalProps {
    onCancel: () => void
    onConfirm: () => Promise<void>
}

export function DeleteBoardConfirmModal({ onCancel, onConfirm }: DeleteBoardConfirmModalProps) {
    const [deleting, setDeleting] = useState(false)

    async function handleConfirm() {
        setDeleting(true)
        await onConfirm()
    }

    return (
        <Modal title="보드 삭제" onClose={onCancel}>
            <p style={{ margin: '0 0 20px', color: 'var(--color-text-muted)' }}>
                정말 삭제하시겠습니까? 삭제된 보드는 복구할 수 없습니다.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                <Button variant="secondary" onClick={onCancel} disabled={deleting}>
                    취소
                </Button>
                <Button
                    variant="primary"
                    onClick={handleConfirm}
                    disabled={deleting}
                    style={{ background: 'var(--color-danger)', border: '1px solid var(--color-danger)' }}
                >
                    {deleting ? '삭제 중...' : '삭제'}
                </Button>
            </div>
        </Modal>
    )
}