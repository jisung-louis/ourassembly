export function ArticleView({ board }) {
  return (
    <div>
      <h2 className="detail-box__title">{board.title}</h2>
      <div className="detail-box__info">
        {board.district && <span className="board-card__district">{board.district}</span>}
        <span>{board.userName}</span>
        <span>{board.createAt?.slice(0, 10)}</span>
        <span>조회 {board.viewCount}</span>
      </div>
    </div>
  )
}
