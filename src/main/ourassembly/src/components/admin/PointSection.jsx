export function PointSection({ data }) {
    if (!data) return (
        <div className="admin-section">
            <div className="admin-section__title">포인트 현황</div>
            <div className="comm-empty">데이터를 불러오지 못했습니다.</div>
        </div>
    )

    return (
        <div className="admin-section">
            <div className="admin-section__title">포인트 현황</div>

            <div className="mini-card-row">
                <div className="mini-card">
                    <div className="mini-card__label">총 발행</div>
                    <div className="mini-card__value mini-card__value--green">
                        {data.totalPointIssued?.toLocaleString()}P
                    </div>
                </div>
                <div className="mini-card">
                    <div className="mini-card__label">총 사용</div>
                    <div className="mini-card__value mini-card__value--red">
                        {data.totalPointUsed?.toLocaleString()}P
                    </div>
                </div>
            </div>

            <div className="admin-section__subtitle">최근 내역</div>
            {data.recentPoints?.map((p, i) => (
                <div key={i} className="admin-list-item">
                    <span className="admin-list-item__name">{p.name}</span>
                    <span className={`admin-list-item__value ${p.change_val > 0 ? 'admin-list-item__value--green' : 'admin-list-item__value--red'}`}>
                        {p.change_val > 0 ? '+' : ''}{p.change_val?.toLocaleString()}P
                    </span>
                </div>
            ))}
        </div>
    )
}