import { useNavigate } from 'react-router-dom'

export function MyReplyList({ replies }) {
  const navigate = useNavigate()
  if (replies.length === 0) return <div className="comm-empty">작성한 댓글이 없습니다.</div>

  return (
    <div>
      {replies.map((r) => (
        <div key={r.replyID} className="my-reply-card" onClick={() => navigate(`/community/board/${r.boardId}`)}>
          <div className="my-reply-card__origin">
            <span className="my-reply-card__origin-label">원글</span>
            <p className="my-reply-card__origin-title">게시글 #{r.boardId}</p>
          </div>
          <div className="my-reply-card__head">
            <span className="my-reply-card__tag">내 댓글</span>
            <span className="my-reply-card__date">{r.createDate?.slice(0, 10)}</span>
          </div>
          <p className="my-reply-card__body">{r.content}</p>
          <div className="my-reply-card__hint">클릭하면 해당 게시글로 이동</div>
        </div>
      ))}
    </div>
  )
}
