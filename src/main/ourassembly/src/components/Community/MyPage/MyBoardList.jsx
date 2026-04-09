import { useNavigate } from 'react-router-dom'
import { BoardCard } from '../Main/BoardCard.jsx'

export function MyBoardList({ boards }) {
  const navigate = useNavigate()
  if (boards.length === 0) return <div className="comm-empty">작성한 게시글이 없습니다.</div>
  return <div>{boards.map((b) => <BoardCard key={b.boardId} board={b} onClick={() => navigate(`/community/board/${b.boardId}`)} />)}</div>
}
