import { useState } from 'react'

export function ReplyForm({ onSubmit, isSending }) {
  const [content, setContent] = useState('')
  function handleSubmit(e) {
    e.preventDefault()
    if (!content.trim()) return
    onSubmit(content.trim())
    setContent('')
  }
  return (
    <form className="reply-form" onSubmit={handleSubmit}>
      <input className="reply-form__input" placeholder="댓글을 입력해 주세요" value={content} onChange={(e) => setContent(e.target.value)} disabled={isSending} />
      <button className="button button--primary" disabled={isSending || !content.trim()} type="submit">{isSending ? '등록 중...' : '등록'}</button>
    </form>
  )
}
