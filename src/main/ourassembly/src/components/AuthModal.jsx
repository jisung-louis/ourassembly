import { useEffect, useEffectEvent, useId, useRef, useState } from 'react'
import './AuthModal.css'
import { searchDistricts } from '../services/district.js'
import { login, sendVerificationEmail, signUp, verifyEmailCode } from '../services/auth.js'
import { Icon } from './Icon.jsx'

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function createLoginForm() {
  return {
    email: '',
    password: '',
  }
}

function createSignupForm() {
  return {
    name: '',
    email: '',
    verificationCode: '',
    address: '',
    password: '',
    passwordConfirm: '',
  }
}

export function AuthModal({
  isOpen,
  initialMode = 'login',
  onAuthSuccess,
  onClose,
}) {
  const titleId = useId()
  const descriptionId = useId()
  const loginEmailRef = useRef(null)
  const signupNameRef = useRef(null)
  const addressBlurTimeoutRef = useRef(null)

  const [mode, setMode] = useState(initialMode)
  const [loginForm, setLoginForm] = useState(createLoginForm)
  const [signupForm, setSignupForm] = useState(createSignupForm)
  const [loginMessage, setLoginMessage] = useState(null)
  const [signupMessage, setSignupMessage] = useState(null)
  const [emailVerification, setEmailVerification] = useState({ status: 'idle', email: '' })
  const [isAddressDropdownOpen, setIsAddressDropdownOpen] = useState(false)
  const [districtSuggestions, setDistrictSuggestions] = useState([])
  const [districtSearchError, setDistrictSearchError] = useState('')
  const [isSearchingDistricts, setIsSearchingDistricts] = useState(false)
  const [pendingAction, setPendingAction] = useState('')

  const showAddressResults =
    mode === 'signup' &&
    isAddressDropdownOpen &&
    signupForm.address.trim().length > 0 &&
    districtSuggestions.length > 0
  const isEmailVerified =
    emailVerification.status === 'verified' && emailVerification.email === signupForm.email.trim()
  const isSignupReady =
    signupForm.name.trim() &&
    emailPattern.test(signupForm.email.trim()) &&
    isEmailVerified &&
    signupForm.address.trim() &&
    signupForm.password.trim() &&
    signupForm.passwordConfirm.trim() &&
    signupForm.password === signupForm.passwordConfirm
  const isLoggingIn = pendingAction === 'login'
  const isSendingVerification = pendingAction === 'sendVerification'
  const isVerifyingCode = pendingAction === 'verifyCode'
  const isSigningUp = pendingAction === 'signup'
  const isBusy = pendingAction !== ''

  function resetState(nextMode = initialMode) {
    setMode(nextMode)
    setLoginForm(createLoginForm())
    setSignupForm(createSignupForm())
    setLoginMessage(null)
    setSignupMessage(null)
    setEmailVerification({ status: 'idle', email: '' })
    setIsAddressDropdownOpen(false)
    setDistrictSuggestions([])
    setDistrictSearchError('')
    setIsSearchingDistricts(false)
    setPendingAction('')
  }

  function handleClose() {
    resetState(initialMode)
    onClose()
  }

  const handleEscapeClose = useEffectEvent(() => {
    handleClose()
  })

  useEffect(() => {
    if (!isOpen) {
      return undefined
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        handleEscapeClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
      window.clearTimeout(addressBlurTimeoutRef.current)
    }
  }, [initialMode, isOpen])

  useEffect(() => {
    if (!isOpen) {
      return undefined
    }

    const timeoutId = window.setTimeout(() => {
      if (mode === 'login') {
        loginEmailRef.current?.focus()
        return
      }

      signupNameRef.current?.focus()
    }, 0)

    return () => window.clearTimeout(timeoutId)
  }, [isOpen, mode])

  useEffect(() => {
    if (!isOpen || mode !== 'signup') {
      return undefined
    }

    const normalizedQuery = signupForm.address.trim()

    if (!normalizedQuery) {
      return undefined
    }

    let ignore = false
    const timeoutId = window.setTimeout(async () => {
      setIsSearchingDistricts(true)
      setDistrictSearchError('')

      try {
        const suggestions = await searchDistricts(normalizedQuery, 10)

        if (!ignore) {
          setDistrictSuggestions(suggestions)
        }
      } catch (error) {
        if (!ignore) {
          setDistrictSuggestions([])
          setDistrictSearchError(error.message)
        }
      } finally {
        if (!ignore) {
          setIsSearchingDistricts(false)
        }
      }
    }, 250)

    return () => {
      ignore = true
      window.clearTimeout(timeoutId)
    }
  }, [isOpen, mode, signupForm.address])

  if (!isOpen) {
    return null
  }

  function handleModeChange(nextMode) {
    setMode(nextMode)
    setLoginMessage(null)
    setSignupMessage(null)
    setDistrictSuggestions([])
    setDistrictSearchError('')
    setIsSearchingDistricts(false)
  }

  function handleLoginFieldChange(field, value) {
    setLoginForm((current) => ({ ...current, [field]: value }))
    setLoginMessage(null)
  }

  function handleSignupFieldChange(field, value) {
    if (field === 'email' && value.trim() !== emailVerification.email) {
      setEmailVerification({ status: 'idle', email: '' })
    }

    if (field === 'address') {
      setDistrictSearchError('')

      if (!value.trim()) {
        setDistrictSuggestions([])
        setIsSearchingDistricts(false)
      }
    }

    setSignupForm((current) => {
      const nextForm = { ...current, [field]: value }

      if (field === 'email' && value !== current.email) {
        nextForm.verificationCode = ''
      }

      return nextForm
    })

    setSignupMessage(null)
  }

  async function handleLoginSubmit(event) {
    event.preventDefault()

    if (!loginForm.email.trim() || !loginForm.password.trim()) {
      setLoginMessage({
        tone: 'error',
        text: '이메일과 비밀번호를 모두 입력해 주세요.',
      })
      return
    }

    setPendingAction('login')
    setLoginMessage(null)

    try {
      const session = await login({
        email: loginForm.email.trim(),
        password: loginForm.password,
      })

      onAuthSuccess?.(session.user)
      handleClose()
    } catch (error) {
      setLoginMessage({
        tone: 'error',
        text: error.message,
      })
    } finally {
      setPendingAction('')
    }
  }

  async function handleSendVerificationCode() {
    if (!signupForm.email.trim()) {
      setSignupMessage({
        tone: 'error',
        text: '인증 메일을 보내려면 이메일을 먼저 입력해 주세요.',
      })
      return
    }

    if (!emailPattern.test(signupForm.email.trim())) {
      setSignupMessage({
        tone: 'error',
        text: '올바른 이메일 형식으로 입력해 주세요.',
      })
      return
    }

    setPendingAction('sendVerification')
    setSignupMessage(null)

    try {
      const message = await sendVerificationEmail(signupForm.email.trim())
      setEmailVerification({ status: 'sent', email: signupForm.email.trim() })
      setSignupForm((current) => ({ ...current, verificationCode: '' }))
      setSignupMessage({
        tone: 'info',
        text: message,
      })
    } catch (error) {
      setSignupMessage({
        tone: 'error',
        text: error.message,
      })
    } finally {
      setPendingAction('')
    }
  }

  async function handleVerifyCode() {
    if (emailVerification.status !== 'sent' && !isEmailVerified) {
      setSignupMessage({
        tone: 'error',
        text: '먼저 인증 메일 발송을 진행해 주세요.',
      })
      return
    }

    if (!/^\d{6}$/.test(signupForm.verificationCode.trim())) {
      setSignupMessage({
        tone: 'error',
        text: '인증번호는 6자리 숫자로 입력해 주세요.',
      })
      return
    }

    setPendingAction('verifyCode')
    setSignupMessage(null)

    try {
      const message = await verifyEmailCode(
        signupForm.email.trim(),
        signupForm.verificationCode.trim(),
      )

      setEmailVerification({ status: 'verified', email: signupForm.email.trim() })
      setSignupMessage({
        tone: 'success',
        text: message,
      })
    } catch (error) {
      setSignupMessage({
        tone: 'error',
        text: error.message,
      })
    } finally {
      setPendingAction('')
    }
  }

  async function handleSignupSubmit(event) {
    event.preventDefault()

    if (!signupForm.name.trim()) {
      setSignupMessage({
        tone: 'error',
        text: '이름을 입력해 주세요.',
      })
      return
    }

    if (!emailPattern.test(signupForm.email.trim())) {
      setSignupMessage({
        tone: 'error',
        text: '이메일 형식을 다시 확인해 주세요.',
      })
      return
    }

    if (!isEmailVerified) {
      setSignupMessage({
        tone: 'error',
        text: '회원가입 전에 이메일 인증을 완료해 주세요.',
      })
      return
    }

    if (!signupForm.address.trim()) {
      setSignupMessage({
        tone: 'error',
        text: '주소를 입력해 주세요.',
      })
      return
    }

    if (!signupForm.password.trim() || !signupForm.passwordConfirm.trim()) {
      setSignupMessage({
        tone: 'error',
        text: '비밀번호와 비밀번호 확인을 모두 입력해 주세요.',
      })
      return
    }

    if (signupForm.password !== signupForm.passwordConfirm) {
      setSignupMessage({
        tone: 'error',
        text: '비밀번호가 일치하지 않습니다.',
      })
      return
    }

    setPendingAction('signup')
    setSignupMessage(null)

    try {
      const message = await signUp({
        name: signupForm.name.trim(),
        email: signupForm.email.trim(),
        address: signupForm.address.trim(),
        password: signupForm.password,
      })

      setMode('login')
      setLoginForm({
        email: signupForm.email.trim(),
        password: signupForm.password,
      })
      setLoginMessage({
        tone: 'success',
        text: '회원가입이 완료되었습니다. 방금 만든 계정으로 로그인해 주세요.',
      })
      setSignupMessage({
        tone: 'success',
        text: message,
      })
    } catch (error) {
      setSignupMessage({
        tone: 'error',
        text: error.message,
      })
    } finally {
      setPendingAction('')
    }
  }

  function handleAddressSelect(addressLabel) {
    setSignupForm((current) => ({ ...current, address: addressLabel }))
    setIsAddressDropdownOpen(false)
    setDistrictSuggestions([])
    setDistrictSearchError('')
    setSignupMessage(null)
  }

  function handleAddressBlur() {
    addressBlurTimeoutRef.current = window.setTimeout(() => {
      setIsAddressDropdownOpen(false)
    }, 120)
  }

  function handleAddressFocus() {
    window.clearTimeout(addressBlurTimeoutRef.current)
    setIsAddressDropdownOpen(true)
  }

  return (
    <div className="modal-backdrop" onClick={handleClose}>
      <div
        aria-describedby={descriptionId}
        aria-labelledby={titleId}
        aria-modal="true"
        className="modal-card"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
      >
        <button
          aria-label="인증 모달 닫기"
          className="modal-close"
          disabled={isBusy}
          onClick={handleClose}
          type="button"
        >
          <Icon className="modal-close__icon" name="close" />
        </button>

        <div className="modal-hero">
          <span className="modal-eyebrow">Account</span>
          <h2 id={titleId}>{mode === 'login' ? '로그인' : '회원가입'}</h2>
          <p id={descriptionId}>
            {mode === 'login'
              ? '이메일과 비밀번호를 입력해 서비스를 이어서 이용하세요.'
              : '이메일 인증과 주소 입력까지 포함한 가입 흐름을 실제 백엔드 API에 연결했습니다.'}
          </p>
        </div>

        <div className="auth-tabs" role="tablist" aria-label="인증 방식">
          <button
            aria-selected={mode === 'login'}
            className={`auth-tabs__button ${mode === 'login' ? 'is-active' : ''}`}
            disabled={isBusy}
            onClick={() => handleModeChange('login')}
            role="tab"
            type="button"
          >
            로그인
          </button>
          <button
            aria-selected={mode === 'signup'}
            className={`auth-tabs__button ${mode === 'signup' ? 'is-active' : ''}`}
            disabled={isBusy}
            onClick={() => handleModeChange('signup')}
            role="tab"
            type="button"
          >
            회원가입
          </button>
        </div>

        {mode === 'login' ? (
          <form className="modal-form" onSubmit={handleLoginSubmit}>
            <label className="field-label field-label--required" htmlFor="login-email">
              이메일
            </label>
            <div className="input-shell">
              <Icon className="input-shell__icon" name="mail" />
              <input
                ref={loginEmailRef}
                autoComplete="email"
                className="input-shell__input"
                disabled={isBusy}
                id="login-email"
                onChange={(event) => handleLoginFieldChange('email', event.target.value)}
                placeholder="name@example.com"
                type="email"
                value={loginForm.email}
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
                disabled={isBusy}
                id="login-password"
                onChange={(event) => handleLoginFieldChange('password', event.target.value)}
                placeholder="비밀번호를 입력해 주세요"
                type="password"
                value={loginForm.password}
              />
            </div>

            {loginMessage ? (
              <p className={`modal-message modal-message--${loginMessage.tone}`}>
                {loginMessage.text}
              </p>
            ) : null}

            <div className="modal-actions">
              <button className="button button--soft" disabled={isBusy} onClick={handleClose} type="button">
                닫기
              </button>
              <button
                className={`button button--primary ${loginForm.email.trim() && loginForm.password.trim() ? '' : 'is-disabled'}`}
                disabled={!loginForm.email.trim() || !loginForm.password.trim() || isBusy}
                type="submit"
              >
                {isLoggingIn ? '로그인 중...' : '로그인'}
              </button>
            </div>
          </form>
        ) : (
          <form className="modal-form" onSubmit={handleSignupSubmit}>
            <label className="field-label field-label--required" htmlFor="signup-name">
              이름
            </label>
            <div className="input-shell">
              <Icon className="input-shell__icon" name="user" />
              <input
                ref={signupNameRef}
                className="input-shell__input"
                disabled={isBusy}
                id="signup-name"
                onChange={(event) => handleSignupFieldChange('name', event.target.value)}
                placeholder="이름을 입력해 주세요"
                type="text"
                value={signupForm.name}
              />
            </div>

            <label className="field-label field-label--required" htmlFor="signup-email">
              이메일
            </label>
            <div className="auth-inline">
              <div className="input-shell auth-inline__grow">
                <Icon className="input-shell__icon" name="mail" />
                <input
                  autoComplete="email"
                  className="input-shell__input"
                  disabled={isBusy}
                  id="signup-email"
                  onChange={(event) => handleSignupFieldChange('email', event.target.value)}
                  placeholder="name@example.com"
                  type="email"
                  value={signupForm.email}
                />
              </div>
              <button
                className="button button--soft auth-inline__button"
                disabled={isBusy}
                onClick={handleSendVerificationCode}
                type="button"
              >
                {isSendingVerification ? '발송 중...' : '인증 메일'}
              </button>
            </div>

            <div className="auth-meta">
              <span className={`auth-status auth-status--${emailVerification.status}`}>
                {emailVerification.status === 'idle' && '인증 전'}
                {emailVerification.status === 'sent' && '인증번호 발송됨'}
                {emailVerification.status === 'verified' && '이메일 인증 완료'}
              </span>
              <span className="auth-helper">가입 전에 이메일 인증이 필요합니다.</span>
            </div>

            {emailVerification.status !== 'idle' ? (
              <>
                <label className="field-label field-label--required" htmlFor="signup-code">
                  인증번호
                </label>
                <div className="auth-inline">
                  <div className="input-shell auth-inline__grow">
                    <Icon className="input-shell__icon" name="shield" />
                    <input
                      className="input-shell__input"
                      disabled={isBusy}
                      id="signup-code"
                      inputMode="numeric"
                      maxLength={6}
                      onChange={(event) =>
                        handleSignupFieldChange('verificationCode', event.target.value)
                      }
                      placeholder="6자리 숫자"
                      type="text"
                      value={signupForm.verificationCode}
                    />
                  </div>
                  <button
                    className="button button--soft auth-inline__button"
                    disabled={isBusy}
                    onClick={handleVerifyCode}
                    type="button"
                  >
                    {isVerifyingCode ? '확인 중...' : '인증 확인'}
                  </button>
                </div>
              </>
            ) : null}

            <label className="field-label field-label--required" htmlFor="signup-address">
              주소
            </label>
            <div className="input-shell">
              <Icon className="input-shell__icon" name="mapPin" />
              <input
                className="input-shell__input"
                disabled={isBusy}
                id="signup-address"
                onBlur={handleAddressBlur}
                onChange={(event) => {
                  handleSignupFieldChange('address', event.target.value)
                  setIsAddressDropdownOpen(true)
                }}
                onFocus={handleAddressFocus}
                placeholder="예) 서울특별시 송파구 잠실동"
                type="text"
                value={signupForm.address}
              />

              {showAddressResults ? (
                <div className="search-dropdown search-dropdown--address">
                  <div className="search-dropdown__header">주소 추천</div>
                  <ul className="search-dropdown__list">
                    {districtSuggestions.map((address) => (
                      <li key={address.id}>
                        <button
                          className="search-dropdown__item"
                          onClick={() => handleAddressSelect(address.fullAddress)}
                          type="button"
                        >
                          <Icon className="search-dropdown__item-icon" name="mapPin" />
                          <span>{address.fullAddress}</span>
                          <Icon className="search-dropdown__item-arrow" name="chevronRight" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>

            {districtSearchError ? (
              <span className="auth-helper auth-helper--error">{districtSearchError}</span>
            ) : isSearchingDistricts ? (
              <span className="auth-helper">주소를 검색하는 중입니다...</span>
            ) : (
              <span className="auth-helper">검색 결과가 없으면 상세 주소를 직접 입력해도 됩니다.</span>
            )}

            <label className="field-label field-label--required" htmlFor="signup-password">
              비밀번호
            </label>
            <div className="input-shell">
              <Icon className="input-shell__icon" name="shield" />
              <input
                autoComplete="new-password"
                className="input-shell__input"
                disabled={isBusy}
                id="signup-password"
                onChange={(event) => handleSignupFieldChange('password', event.target.value)}
                placeholder="비밀번호를 입력해 주세요"
                type="password"
                value={signupForm.password}
              />
            </div>

            <label className="field-label field-label--required" htmlFor="signup-password-confirm">
              비밀번호 확인
            </label>
            <div className="input-shell">
              <Icon className="input-shell__icon" name="shield" />
              <input
                autoComplete="new-password"
                className="input-shell__input"
                disabled={isBusy}
                id="signup-password-confirm"
                onChange={(event) => handleSignupFieldChange('passwordConfirm', event.target.value)}
                placeholder="비밀번호를 한 번 더 입력해 주세요"
                type="password"
                value={signupForm.passwordConfirm}
              />
            </div>

            {signupForm.passwordConfirm.trim() ? (
              <span
                className={`auth-helper ${signupForm.password === signupForm.passwordConfirm ? 'auth-helper--success' : 'auth-helper--error'}`}
              >
                {signupForm.password === signupForm.passwordConfirm
                  ? '비밀번호가 일치합니다.'
                  : '비밀번호가 서로 다릅니다.'}
              </span>
            ) : null}

            <div className="modal-note">
              <Icon className="modal-note__icon" name="landmark" />
              <span>입력한 주소는 이후 지역구 연결과 맞춤형 경험 구성에 활용됩니다.</span>
            </div>

            {signupMessage ? (
              <p className={`modal-message modal-message--${signupMessage.tone}`}>
                {signupMessage.text}
              </p>
            ) : null}

            <div className="modal-actions">
              <button className="button button--soft" disabled={isBusy} onClick={handleClose} type="button">
                닫기
              </button>
              <button
                className={`button button--primary ${isSignupReady ? '' : 'is-disabled'}`}
                disabled={!isSignupReady || isBusy}
                type="submit"
              >
                {isSigningUp ? '가입 중...' : '회원가입'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
