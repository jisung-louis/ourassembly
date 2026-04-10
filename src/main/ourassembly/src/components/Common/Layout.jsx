import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import './Layout.css'
import { Icon, LogoMark } from './Icon.jsx'
import { NotificationBell } from '../Notification/NotificationBell.jsx'
import { getAuthSession } from '../../services/auth.js'
import { apiClient } from '../../services/apiClient.js'

const footerLinks = [
  '개인정보처리방침',
  '접근성 안내',
  '문의하기',
]

export function SiteLayout({ children, actions = [], headerGreeting = '', pageClassName = '' }) {
  const [unreadCount, setUnreadCount] = useState(0)

  const isLoggedin = actions.some(a => a.id === 'logout')

  useEffect(() => {
    if (!isLoggedin) {
      setUnreadCount(0)
      return
    }
    const session = getAuthSession()
    if (!session?.token) return
    apiClient.get('/api/notification/unread-count', {
      headers: { Authorization: `Bearer ${session.token}` }
    })
      .then(res => setUnreadCount(res.data))
      .catch(() => setUnreadCount(0))
  }, [isLoggedin])

  useEffect(() => {
    const handleServiceWorkerMessage = (event) => {
      if (event.data?.type === 'FCM_RECEIVE') {
        setUnreadCount(prev => prev + 1)
      }
    }
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', handleServiceWorkerMessage)
    }
    return () => {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.removeEventListener('message', handleServiceWorkerMessage)
      }
    }
  }, [])

  const finalActions = isLoggedin
    ? [...actions, { id: 'notifications', label: <NotificationBell unreadCount={unreadCount} onRead={() => setUnreadCount(0)} />, isCustom: true }]
    : actions

  const hasHeaderTools = Boolean(headerGreeting) || finalActions.length > 0

  return (
    <div className="site-shell">
      <header className="site-header">
        <div className="site-header__inner">
          <Link className="site-brand" to="/">
            <LogoMark className="site-brand__logo" />
            <span className="site-brand__text">우리동네 국회의원</span>
          </Link>
          {hasHeaderTools ? (
            <div className="site-header__tools">
              {headerGreeting ? <p className="site-header__greeting">{headerGreeting}</p> : null}
              {finalActions.length > 0 ? (
                <nav className="site-header__actions" aria-label="주요 작업">
                  {finalActions.map((action) => (
                    <HeaderAction key={action.id ?? `${action.label}-${action.to ?? 'button'}`} action={action} />
                  ))}
                </nav>
              ) : null}
            </div>
          ) : null}
        </div>
      </header>

      <main className={`site-main ${pageClassName}`.trim()}>{children}</main>

      <footer className="site-footer">
        <div className="site-footer__inner">
          <div className="site-footer__brand">
            <LogoMark className="site-footer__logo" />
            <span>우리동네 국회의원</span>
          </div>
          <p className="site-footer__copy">
            시민과 국회의원을 연결하는 투명한 민주주의 소통 플랫폼입니다.
          </p>
          <div className="site-footer__links">
            {footerLinks.map((label) => (
  <a        // ← 이 부분이 계속 없어지는 거예요, 직접 타이핑!
    key={label}
    className="site-footer__link"
    href="/ourassembly/public"
    onClick={(event) => event.preventDefault()}
  >
    {label}
  </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  )
}

function HeaderAction({ action }) {
  if (action.isCustom) {
    return <div className="header-action-custom">{action.label}</div>
  }

  const className = `header-action header-action--${action.variant || 'ghost'}`

  if (action.onClick) {
    return (
      <button
        className={className}
        onClick={action.onClick}
        type={action.type ?? 'button'}
      >
        {action.icon ? <Icon className="header-action__icon" name={action.icon} /> : null}
        <span>{action.label}</span>
      </button>
    )
  }

  return (
    <Link className={className} to={action.to}>
      {action.icon ? <Icon className="header-action__icon" name={action.icon} /> : null}
      <span>{action.label}</span>
    </Link>
  )
}

export function Avatar({ member, size = 'md', square = false }) {
  const shapeClassName = square ? 'avatar--square' : 'avatar--round'
  const [failedImageUrl, setFailedImageUrl] = useState('')
  const showPhoto = member.photoUrl && member.photoUrl !== failedImageUrl

  return (
    <div className={`avatar ${shapeClassName} avatar--${size} avatar--${member.theme}`}>
      {showPhoto ? (
        <img
          alt={`${member.name ?? member.avatarLabel} 프로필 사진`}
          className="avatar__image"
          onError={() => setFailedImageUrl(member.photoUrl)}
          src={member.photoUrl}
        />
      ) : (
        <span className="avatar__label">{member.avatarLabel}</span>
      )}
    </div>
  )
}

export function Portrait({ member }) {
  return (
    <div className={`portrait portrait--${member.theme}`}>
      <div className="portrait__frame">
        <div className="portrait__spotlight" />
        <div className="portrait__initials">{member.avatarLabel}</div>
        <div className="portrait__caption">
          <span className="portrait__name">{member.name}</span>
          <span className="portrait__district">{member.districtShort}</span>
        </div>
      </div>
    </div>
  )
}