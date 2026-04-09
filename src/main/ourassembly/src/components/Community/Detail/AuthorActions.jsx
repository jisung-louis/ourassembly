export function AuthorActions({ onEdit, onDelete }) {
  return (
    <div className="detail-author-btns">
      <button className="button button--soft" onClick={onEdit} type="button">수정</button>
      <button className="button button--soft" onClick={onDelete} type="button" style={{ color: '#be123c' }}>삭제</button>
    </div>
  )
}
