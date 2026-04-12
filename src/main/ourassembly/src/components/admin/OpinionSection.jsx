export function OpinionSection({ data }) {
    if (!data) return (
        <div className="admin-section">
            <div className="admin-section__title">의견 현황</div>
            <div className="comm-empty">데이터를 불러오지 못했습니다.</div>
        </div>
    )

    return (
        <div className="admin-section">
            <div className="admin-section__title">의견 현황</div>

            <div className="mini-card-row">
                <div className="mini-card">
                    <div className="mini-card__label">전체</div>
                    <div className="mini-card__value">{data.totalOpinions?.toLocaleString()}</div>
                </div>
                <div className="mini-card">
                    <div className="mini-card__label">답변대기</div>
                    <div className="mini-card__value mini-card__value--red">{data.pendingOpinions?.toLocaleString()}</div>
                </div>
                <div className="mini-card">
                    <div className="mini-card__label">답변완료</div>
                    <div className="mini-card__value mini-card__value--green">{data.answeredOpinions?.toLocaleString()}</div>
                </div>
            </div>

            <div className="admin-section__subtitle">의견 많이 받은 국회의원 TOP5</div>
            {data.topCongressmanByOpinion?.map((c, i) => (
                <div key={i} className="admin-list-item">
                    <span className="admin-list-item__name">{c.name}</span>
                    <span className="admin-list-item__value">{c.cnt}개</span>
                </div>
            ))}
        </div>
    )
}