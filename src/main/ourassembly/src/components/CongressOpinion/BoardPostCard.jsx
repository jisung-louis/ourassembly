import { useState } from 'react'
import { Icon } from '../../components/Common/Icon.jsx'

const STATUS_LABELS = {
  answered: '답변 완료',
  reviewing: '검토 중',
  pending: '답변 대기'
}

export function BoardPostCard({ post, memberName, defaultExpanded }) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)

  return (
    <article className="board-post-card">
      <div className="board-post-card__top">
        <div className="board-post-card__title-wrap">
          <Icon className="board-post-card__chevron" name="chevronRight" />
          <div>
            <h3>{post.title}</h3>
            <p>{post.excerpt}</p>
          </div>
        </div>
        <div className="board-post-card__actions">
          <span className={`status-pill status-pill--${post.status}`}>
            <Icon 
              className="status-pill__icon" 
              name={post.status === 'answered' ? 'checkCircle' : 'clock'} 
            />
            {STATUS_LABELS[post.status] || STATUS_LABELS.pending}
          </span>
        </div>
      </div>

      <div className="board-post-card__meta">
        <div className="meta-row"><Icon name="user" /><span>{post.author}</span></div>
        <div className="meta-row"><Icon name="calendar" /><span>{post.date}</span></div>
        
        {post.status === 'answered' && (
          <button className="text-action" onClick={() => setIsExpanded(!isExpanded)}>
            <Icon name="chat" />
            <span>{isExpanded ? '답변 숨기기' : '답변 보기'}</span>
          </button>
        )}
      </div>

      {post.status === 'answered' && isExpanded && (
        <div className="board-post-card__answer">
          <div className="board-post-card__answer-head">
            <span className="qa-card__mark qa-card__mark--answer">A</span>
            <strong>{memberName}</strong>
          </div>
          <p>{post.answer}</p>
        </div>
      )}
    </article>
  )
}