export function BoardCard({ board, onClick }) {
  return (
    <article className="board-card" onClick={onClick}>
      <div className="board-card__top">
        {board.district ? <span className="board-card__district">{board.district}</span> : <span />}
        <div className="board-card__meta">
          <span>{board.userName}</span>
          <span>{board.createAt?.slice(0, 10)}</span>
        </div>
      </div>
      <h3 className="board-card__title">{board.title}</h3>
      <p className="board-card__snippet">{board.content}</p>
      <div className="board-card__footer">
        <span>👁 {board.viewCount}</span>
        <span>❤️ {board.likeCount}</span>
      </div>
    </article>
  )
}
