import { Link } from 'react-router-dom'
import { Icon, LogoMark } from './Icon.jsx'

const footerLinks = [
  '개인정보처리방침',
  '접근성 안내',
  '문의하기',
]

export function SiteLayout({ children, actions = [], pageClassName = '' }) {
  return (
    <div className={`site-shell ${pageClassName}`.trim()}>
      <header className="site-header">
        <div className="site-header__inner">
          <Link className="site-brand" to="/">
            <LogoMark className="site-brand__logo" />
            <span className="site-brand__text">우리동네 국회의원</span>
          </Link>

          {actions.length > 0 ? (
            <nav className="site-header__actions" aria-label="페이지 이동">
              {actions.map((action) => (
                <Link
                  key={`${action.label}-${action.to}`}
                  className={`header-action header-action--${action.variant || 'ghost'}`}
                  to={action.to}
                >
                  {action.icon ? <Icon className="header-action__icon" name={action.icon} /> : null}
                  <span>{action.label}</span>
                </Link>
              ))}
            </nav>
          ) : null}
        </div>
      </header>

      <main className="site-main">{children}</main>

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
              <a
                key={label}
                className="site-footer__link"
                href="/"
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

export function Avatar({ member, size = 'md', square = false }) {
  const shapeClassName = square ? 'avatar--square' : 'avatar--round'

  return (
    <div className={`avatar ${shapeClassName} avatar--${size} avatar--${member.theme}`}>
      <span className="avatar__label">{member.avatarLabel}</span>
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
