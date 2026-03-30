import { useEffect, useId, useRef } from 'react'
import { Icon } from './Icon.jsx'

export function LoginModal({
  isOpen,
  form,
  message,
  onClose,
  onFieldChange,
  onSubmit,
}) {
  const titleId = useId()
  const descriptionId = useId()
  const emailInputRef = useRef(null)

  useEffect(() => {
    if (!isOpen) {
      return undefined
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const timeoutId = window.setTimeout(() => {
      emailInputRef.current?.focus()
    }, 0)

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.clearTimeout(timeoutId)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen) {
    return null
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        aria-describedby={descriptionId}
        aria-labelledby={titleId}
        aria-modal="true"
        className="modal-card"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
      >
        <button
          aria-label="로그인 모달 닫기"
          className="modal-close"
          onClick={onClose}
          type="button"
        >
          <Icon className="modal-close__icon" name="close" />
        </button>

        <div className="modal-hero">
          <span className="modal-eyebrow">Account</span>
          <h2 id={titleId}>로그인</h2>
          <p id={descriptionId}>
            이메일과 비밀번호를 입력해 서비스를 이어서 이용하세요.
          </p>
        </div>

        <form className="modal-form" onSubmit={onSubmit}>
          <label className="field-label field-label--required" htmlFor="login-email">
            이메일
          </label>
          <div className="input-shell">
            <Icon className="input-shell__icon" name="mail" />
            <input
              ref={emailInputRef}
              autoComplete="email"
              className="input-shell__input"
              id="login-email"
              onChange={(event) => onFieldChange('email', event.target.value)}
              placeholder="name@example.com"
              type="email"
              value={form.email}
            />
          </div>

          <label className="field-label field-label--required" htmlFor="login-password">
            비밀번호
          </label>
          <div className="input-shell">
            <Icon className="input-shell__icon" name="shield" />
            <input
              autoComplete="current-password"
              className="input-shell__input"
              id="login-password"
              onChange={(event) => onFieldChange('password', event.target.value)}
              placeholder="비밀번호를 입력해 주세요"
              type="password"
              value={form.password}
            />
          </div>

          {message ? (
            <p className={`modal-message modal-message--${message.tone}`}>
              {message.text}
            </p>
          ) : null}

          <div className="modal-actions">
            <button className="button button--soft" onClick={onClose} type="button">
              닫기
            </button>
            <button
              className={`button button--primary ${form.email.trim() && form.password.trim() ? '' : 'is-disabled'}`}
              disabled={!form.email.trim() || !form.password.trim()}
              type="submit"
            >
              로그인
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
