export function UserInfoCard({ userInfo, point = 0 }) {
  if (!userInfo) return null
  return (
      <div className="mypage-card">
        <div className="mypage-card__row">
          <div className="mypage-card__avatar">{userInfo.name?.slice(0, 1)}</div>
          <div>
            <h2 className="mypage-card__name">{userInfo.name}님</h2>
            <div className="mypage-card__sub">
              <span>{userInfo.email}</span>
              <span>가입일 {userInfo.createAt?.slice(0, 10)}</span>
              <span>💰 {point.toLocaleString()} 포인트</span>
            </div>
          </div>
        </div>
      </div>
  )
}