import { Avatar } from '../../components/Common/Layout.jsx'
import { Icon } from '../../components/Common/Icon.jsx'

export function Board({ member }) {
  return (
    <section className="panel panel--board-hero">
      <div className="board-hero">
        <div className="board-hero__profile">
          <Avatar member={member} size="lg" square />
          <div>
            <h1>국회의원과 소통하기</h1>
            <p>
              <strong>{member.name}</strong>에게 메시지를 보내세요 · {member.district}
            </p>
          </div>
        </div>
        <div className="board-hero__status">
          <span className="status-pill status-pill--answered">
            <Icon className="status-pill__icon" name="checkCircle" />
            활동 중
          </span>
          <span className="board-hero__count">답변 완료 {member.responseCount}건</span>
        </div>
      </div>
    </section>
  )
}