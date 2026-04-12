export function CommunitySection({ data }) {
    if (!data) return (
        <div className="admin-section">
            <div className="admin-section__title">커뮤니티 현황</div>
            <div className="comm-empty">데이터를 불러오지 못했습니다.</div>
        </div>
    )

    return (
        <div className="admin-section">
            <div className="admin-section__title">커뮤니티 현황</div>

            <div className="admin-section__subtitle">지역별 게시글 TOP5</div>
            {data.topDistricts?.map((d, i) => (
                <div key={i} className="admin-list-item">
                    <span className="admin-list-item__name">{d.district}</span>
                    <span className="admin-list-item__value">{d.cnt}개</span>
                </div>
            ))}

            <div className="admin-section__subtitle">좋아요 TOP5</div>
            {data.topBoards?.map((b, i) => (
                <div key={i} className="admin-list-item">
                    <span className="admin-list-item__name">{b.title}</span>
                    <span className="admin-list-item__value">❤️ {b.like_count}</span>
                </div>
            ))}
        </div>
    )
}