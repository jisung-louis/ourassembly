import { Link } from 'react-router-dom'
import { Icon } from '../Common/Icon.jsx'
import { SectionHeading } from './PanelCard.jsx'

function buildPostLink(boardPath, postId) {
  if (!boardPath) {
    return null
  }

  return `${boardPath}?post=${encodeURIComponent(postId)}`
}

export function RecentAnswersSection({ posts, responseCount, boardPath }) {
  return (
    <section className="panel">
      <SectionHeading
        badge={<span className="status-pill status-pill--answered">{responseCount}건 답변 완료</span>}
        icon="chat"
        title="최근 답변"
        action={
          boardPath ? (
            <Link className="section-heading__action" to={boardPath}>
              <span>전체 보기</span>
              <Icon className="section-heading__action-icon" name="chevronRight" />
            </Link>
          ) : null
        }
      />

      {posts.length > 0 ? (
        <div className="qa-list">
          {posts.map((post) => {
            const postLink = buildPostLink(boardPath, post.id)
            const questionContent = (
              <>
                <span className="qa-card__mark qa-card__mark--question">Q</span>
                <div className="qa-card__content">
                  <h3>{post.title}</h3>
                  <div className="meta-row">
                    <span>{post.author}</span>
                    <span className="meta-row__dot" />
                    <span>{post.date}</span>
                  </div>
                </div>
                <Icon className="qa-card__arrow" name="chevronRight" />
              </>
            )

            return (
              <article key={post.id} className="qa-card">
                {postLink ? (
                  <Link className="qa-card__question" to={postLink}>
                    {questionContent}
                  </Link>
                ) : (
                  <div className="qa-card__question">{questionContent}</div>
                )}
                {post.answer ? (
                  <div className="qa-card__answer">
                    <span className="qa-card__mark qa-card__mark--answer">A</span>
                    <p>{post.answer}</p>
                  </div>
                ) : null}
              </article>
            )
          })}
        </div>
      ) : (
        <p className="body-copy">최근 답변 내역이 아직 없습니다.</p>
      )}
    </section>
  )
}
