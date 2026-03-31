import { Icon } from '../../components/Common/Icon.jsx'

export function MessageComposer({ 
  isSent, 
  draft, 
  setDraft, 
  onSubmit, 
  onReset, 
  memberName 
}) {
  if (isSent) {
    return (
      <section className="panel panel--composer">
        <div className="composer-success">
          <div className="composer-success__icon-wrap">
            <Icon className="composer-success__icon" name="checkCircle" />
          </div>
          <div className="composer-success__body">
            <h3>메시지가 전달되었어요!</h3>
            <p>{memberName}에게 메시지가 접수되었습니다. 답변이 등록되면 업데이트됩니다.</p>
          </div>
          <button className="button button--text" onClick={onReset} type="button">
            다른 메시지 보내기
          </button>
        </div>
      </section>
    )
  }

  return (
    <section className="panel panel--composer">
      <div className="section-heading">
        <div className="section-heading__main">
          <Icon className="section-heading__icon" name="send" />
          <h2>메시지 작성</h2>
        </div>
      </div>
      <form className="composer-form" onSubmit={onSubmit}>
        <label className="field-label field-label--required" htmlFor="message-title">제목 / 주제</label>
        <input
          id="message-title"
          className="composer-input"
          type="text"
          placeholder="예) 골목길 보행 안전 시설 설치를 요청합니다"
          value={draft.title}
          onChange={(e) => setDraft(prev => ({ ...prev, title: e.target.value }))}
        />
        
        <label className="field-label field-label--required" htmlFor="message-body">내용</label>
        <div className="composer-textarea-wrap">
          <textarea
            id="message-body"
            className="composer-textarea"
            maxLength={500}
            value={draft.body}
            onChange={(e) => setDraft(prev => ({ ...prev, body: e.target.value }))}
          />
          <span className="composer-counter">{draft.body.length}/500</span>
        </div>

        <button 
          className={`button button--primary button--block ${draft.title && draft.body ? '' : 'is-disabled'}`}
          disabled={!draft.title.trim() || !draft.body.trim()}
          type="submit"
        >
          <Icon className="button__icon" name="send" />
          <span>메시지 보내기</span>
        </button>
      </form>
    </section>
  )
}