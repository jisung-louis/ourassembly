import { useState } from 'react'

export function ReplyItem({ reply, canEdit, canDelete, onUpdate, onDelete, isSending }) {
  const [editing, setEditing] = useState(false)
  const [editVal, setEditVal] = useState(reply.content)

  function handleSave() {
    if (!editVal.trim()) return
    onUpdate(reply.replyID, editVal.trim())
    setEditing(false)
  }

  return (
    <div className="reply-item">
      <div className="reply-item__head">
        <span className="reply-item__author">사용자 #{reply.userId}</span>
        <span className="reply-item__date">{reply.createDate?.slice(0, 10)}</span>
      </div>
      {editing ? (
        <div className="reply-edit-row">
          <input className="reply-form__input" value={editVal} onChange={(e) => setEditVal(e.target.value)} disabled={isSending} />
          <button className="button button--primary" onClick={handleSave} disabled={isSending} type="button">저장</button>
          <button className="button button--soft" onClick={() => setEditing(false)} type="button">취소</button>
        </div>
      ) : (
        <>
          <p className="reply-item__body">{reply.content}</p>
          {(canEdit || canDelete) && (
            <div className="reply-item__btns">
              {canEdit && <button className="reply-action" onClick={() => { setEditing(true); setEditVal(reply.content) }} type="button">수정</button>}
              {canDelete && <button className="reply-action" onClick={() => onDelete(reply.replyID)} type="button">삭제</button>}
            </div>
          )}
        </>
      )}
    </div>
  )
}
