import { BoardCard } from './BoardCard.jsx'

export function PopularSection({ boards, selectedDistrict, onNavigate }) {
    const popular = boards
        .filter((b) => b.viewCount >= 10)
        .sort((a, b) => b.viewCount - a.viewCount)
        .slice(0, 5)

    if (popular.length === 0) return null

    return (
        <div style={{ marginBottom: 28 }}>
            <div className="comm-section-head">
                <span style={{ color: '#f59e0b', fontSize: 18 }}>🔥</span>
                <h2>{selectedDistrict === '전체' ? '인기글' : `${selectedDistrict} 인기글`}</h2>
            </div>
            {popular.map((b) => (
                <BoardCard key={b.boardId} board={b} onClick={() => onNavigate(b.boardId)} />
            ))}
            <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '24px 0' }} />
        </div>
    )
}