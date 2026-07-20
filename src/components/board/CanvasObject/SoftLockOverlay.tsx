/** 캔버스 객체 편집 중 오버레이(편집 중 표시) */
interface SoftLockOverlayProps {
    nickname: string
}

export function SoftLockOverlay({ nickname }: SoftLockOverlayProps) {
    return (
        <div
            style={{
                position: 'absolute',
                inset: 0,
                border: '2px dashed #F59E0B',
                borderRadius: 4,
            }}
        >
            <span
                style={{
                    position: 'absolute',
                    top: -26,
                    left: 0,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    fontSize: 11,
                    padding: '2px 8px',
                    borderRadius: 999,
                    background: '#F59E0B',
                    color: '#fff',
                    whiteSpace: 'nowrap',
                }}
            >
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff' }} />
                {nickname}님이 편집 중
            </span>
        </div>
    )
}