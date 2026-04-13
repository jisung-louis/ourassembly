export function UserSection({ data }) {
    if (!data) return (
        <div className="admin-section">
            <div className="admin-section__title">회원 현황</div>
            <div className="comm-empty">데이터를 불러오지 못했습니다.</div>
        </div>
    )

    return (
        <div className="admin-section">
            <div className="admin-section__title">회원 현황</div>

            <div className="admin-section__subtitle">최근 가입 회원</div>
            {data.recentUsers?.map((u, i) => (
                <div key={i} className="admin-list-item">
                    <span className="admin-list-item__name">{u.name}</span>
                    <span className="admin-list-item__value">{u.email}</span>
                </div>
            ))}

            <div className="admin-section__subtitle">게시글 많이 쓴 유저 TOP5</div>
            {data.topBoardUsers?.map((u, i) => (
                <div key={i} className="admin-list-item">
                    <span className="admin-list-item__name">{u.name}</span>
                    <span className="admin-list-item__value">{u.cnt}개</span>
                </div>
            ))}
        </div>
    )
}