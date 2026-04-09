export function LikeButton({ liked, count, onToggle }) {
  return (
    <div className="detail-box__actions">
      <button className={`like-btn ${liked ? 'is-liked' : ''}`} onClick={onToggle} type="button">
        ❤️ 좋아요 {count}
      </button>
    </div>
  )
}
