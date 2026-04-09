import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  fetchBoardDetail, toggleBoardLike, deleteBoard,
  fetchReplies, createReply, updateReply, deleteReply,
} from '../../services/communityApi.js'
import { getStoredAuthUser } from '../../services/auth.js'
import { ArticleView } from '../../components/Community/Detail/ArticleView.jsx'
import { LikeButton } from '../../components/Community/Detail/LikeButton.jsx'
import { AuthorActions } from '../../components/Community/Detail/AuthorActions.jsx'
import { ReplyForm } from '../../components/Community/Detail/ReplyForm.jsx'
import { ReplyItem } from '../../components/Community/Detail/ReplyItem.jsx'

export function DetailPage() {
  const { boardId } = useParams()
  const navigate = useNavigate()
  const currentUser = getStoredAuthUser()

  const [board, setBoard] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [replies, setReplies] = useState([])
  const [repliesLoading, setRepliesLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)

  useEffect(() => {
    let ignore = false
    setIsLoading(true)
    fetchBoardDetail(boardId)
      .then((data) => { if (!ignore) { setBoard(data); setLikeCount(data.likeCount || 0) } })
      .catch((e) => { if (!ignore) setError(e.message) })
      .finally(() => { if (!ignore) setIsLoading(false) })
    return () => { ignore = true }
  }, [boardId])

  useEffect(() => { loadReplies() }, [boardId])

  async function loadReplies() {
    setRepliesLoading(true)
    try { const data = await fetchReplies(boardId); setReplies(Array.isArray(data) ? data : []) }
    catch { setReplies([]) }
    finally { setRepliesLoading(false) }
  }

  async function handleLike() {
    if (!currentUser) { alert('로그인이 필요합니다.'); return }
    try {
      const result = await toggleBoardLike(boardId)
      setLiked(result === true)
      setLikeCount((c) => result === true ? c + 1 : Math.max(0, c - 1))
    } catch (e) { alert(e.message) }
  }

  async function handleDeleteBoard() {
    if (!window.confirm('정말 삭제하시겠습니까?')) return
    try { await deleteBoard(boardId); navigate('/community', { replace: true }) }
    catch (e) { alert(e.message) }
  }

  async function handleReplyCreate(content) {
    if (!currentUser) { alert('로그인이 필요합니다.'); return }
    setIsSending(true)
    try { await createReply({ boardId: Number(boardId), content }); await loadReplies() }
    catch (e) { alert(e.message) }
    finally { setIsSending(false) }
  }

  async function handleReplyUpdate(replyId, content) {
    setIsSending(true)
    try { await updateReply({ replyId, content }); await loadReplies() }
    catch (e) { alert(e.message) }
    finally { setIsSending(false) }
  }

  async function handleReplyDelete(replyId) {
    if (!window.confirm('댓글을 삭제하시겠습니까?')) return
    try { await deleteReply(replyId); await loadReplies() }
    catch (e) { alert(e.message) }
  }

  if (isLoading) return <div className="comm-loading"><div className="comm-spinner" /><span>게시글을 불러오는 중...</span></div>
  if (error || !board) return <div className="comm-empty">{error || '게시글을 찾을 수 없습니다.'}</div>

  const isAuthor = currentUser && currentUser.name === board.userName

  return (
    <>
      <button className="comm-back" onClick={() => navigate('/community')} type="button">← 목록으로</button>

      <div className="detail-box">
        <div className="detail-box__header">
          <ArticleView board={board} />
          {isAuthor && <AuthorActions onEdit={() => navigate(`/community/edit/${boardId}`)} onDelete={handleDeleteBoard} />}
        </div>
        <p className="detail-box__body">{board.content}</p>
        <LikeButton liked={liked} count={likeCount} onToggle={handleLike} />
      </div>

      <div className="reply-section">
        <h3 className="reply-section__title">댓글 {replies.length}개</h3>
        {currentUser && <ReplyForm onSubmit={handleReplyCreate} isSending={isSending} />}
        {repliesLoading ? (
          <div className="comm-loading" style={{ padding: '32px 0' }}><div className="comm-spinner" /></div>
        ) : replies.length === 0 ? (
          <div className="comm-empty" style={{ padding: '32px 0' }}>아직 댓글이 없습니다.</div>
        ) : (
          <div className="reply-list">
            {replies.map((r) => {
              const isReplyAuthor = currentUser?.id === r.userId
              const canDelete = isReplyAuthor || isAuthor
              const canEdit = isReplyAuthor
              return <ReplyItem key={r.replyID} reply={r} canEdit={canEdit} canDelete={canDelete}
                onUpdate={handleReplyUpdate} onDelete={handleReplyDelete} isSending={isSending} />
            })}
          </div>
        )}
      </div>
    </>
  )
}
