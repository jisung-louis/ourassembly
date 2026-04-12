export function StatCard({ data }) {
    if (!data) return null

    const items = [
        { label: '전체 회원', value: data.totalUsers?.toLocaleString() },
        { label: '전체 게시글', value: data.totalBoards?.toLocaleString() },
        { label: '전체 댓글', value: data.totalReplies?.toLocaleString() },
        { label: '포인트 발행', value: `${data.totalPointIssued?.toLocaleString()}P`, color: 'green' },
        { label: '포인트 사용', value: `${data.totalPointUsed?.toLocaleString()}P`, color: 'red' },
        { label: '오늘 게시글', value: data.todayBoards?.toLocaleString() },
        { label: '오늘 댓글', value: data.todayReplies?.toLocaleString() },
    ]

    return (
        <div className="stat-grid">
            {items.map((item) => (
                <div key={item.label} className="stat-card">
                    <div className="stat-card__label">{item.label}</div>
                    <div className={`stat-card__value${item.color ? ` stat-card__value--${item.color}` : ''}`}>
                        {item.value ?? '-'}
                    </div>
                </div>
            ))}
        </div>
    )
}