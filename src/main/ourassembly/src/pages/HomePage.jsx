import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon, LogoMark } from '../components/Icon.jsx'
import { LoginModal } from '../components/LoginModal.jsx'
import { SiteLayout, Avatar } from '../components/Layout.jsx'
import {
  addressSuggestions,
  homeInfoCards,
  nameQuickFilters,
  searchAddresses,
  searchMembersByQuery,
} from '../data/mockData.js'

export function HomePage() {
  const navigate = useNavigate()
  const [mode, setMode] = useState('address')
  const [addressQuery, setAddressQuery] = useState('')
  const [nameQuery, setNameQuery] = useState('')
  const [isLoginOpen, setIsLoginOpen] = useState(false)
  const [loginForm, setLoginForm] = useState({ email: '', password: '' })
  const [loginMessage, setLoginMessage] = useState(null)

  const filteredAddresses = searchAddresses(addressQuery)
  const filteredMembers = searchMembersByQuery(nameQuery)
  const showAddressResults = mode === 'address' && addressQuery.trim().length > 0
  const showNameResults = mode === 'name' && nameQuery.trim().length > 0
  const actions = [
    {
      id: 'login',
      icon: 'user',
      label: '로그인',
      onClick: () => {
        setLoginMessage(null)
        setIsLoginOpen(true)
      },
      variant: 'primary',
    },
  ]

  const handleAddressSubmit = (event) => {
    event.preventDefault()

    if (!addressQuery.trim()) {
      return
    }

    const firstMatch = filteredAddresses[0] ?? addressSuggestions[0]
    navigate(`/members/${firstMatch.memberId}`)
  }

  const handleNameSubmit = (event) => {
    event.preventDefault()

    if (!nameQuery.trim() || filteredMembers.length === 0) {
      return
    }

    navigate(`/members/${filteredMembers[0].id}`)
  }

  const handleCurrentLocation = () => {
    setMode('address')
    setAddressQuery('잠실동')
  }

  const handleLoginFieldChange = (field, value) => {
    setLoginForm((current) => ({ ...current, [field]: value }))
    setLoginMessage(null)
  }

  const handleLoginClose = () => {
    setIsLoginOpen(false)
    setLoginMessage(null)
  }

  const handleLoginSubmit = (event) => {
    event.preventDefault()

    if (!loginForm.email.trim() || !loginForm.password.trim()) {
      setLoginMessage({
        tone: 'error',
        text: '이메일과 비밀번호를 모두 입력해 주세요.',
      })
      return
    }

    // 실제 요청은 다음 단계에서 /api/user/login 연동으로 교체한다.
    setLoginMessage({
      tone: 'info',
      text: '로그인 UI가 준비되었습니다. 다음 단계에서 실제 API와 연결합니다.',
    })
  }

  return (
    <SiteLayout actions={actions} pageClassName="page page--home">
      <section className="home-hero">
        <div className="home-hero__badge">
          <div className="home-hero__brandmark">
            <LogoMark className="home-hero__brandicon" />
          </div>
        </div>

        <div className="home-hero__copy">
          <h1>우리동네 국회의원</h1>
          <p>
            내 지역구를 대표하는 국회의원을 바로 찾고, 직접 의견을 전달해 보세요.
          </p>
        </div>
      </section>

      <section className="home-search">
        <div className="search-panel">
          <div className="search-tabs" role="tablist" aria-label="검색 방식">
            <button
              className={`search-tabs__button ${mode === 'address' ? 'is-active' : ''}`}
              onClick={() => setMode('address')}
              role="tab"
              type="button"
            >
              <Icon className="search-tabs__icon" name="mapPin" />
              <span>주소로 찾기</span>
            </button>
            <button
              className={`search-tabs__button ${mode === 'name' ? 'is-active' : ''}`}
              onClick={() => setMode('name')}
              role="tab"
              type="button"
            >
              <Icon className="search-tabs__icon" name="searchUser" />
              <span>이름으로 찾기</span>
            </button>
          </div>

          {mode === 'address' ? (
            <form className="search-form" onSubmit={handleAddressSubmit}>
              <label className="field-label" htmlFor="home-address">
                내 주소 입력
              </label>
              <div className="input-shell">
                <Icon className="input-shell__icon" name="mapPin" />
                <input
                  id="home-address"
                  className="input-shell__input"
                  type="text"
                  placeholder="예) 잠실동"
                  value={addressQuery}
                  onChange={(event) => setAddressQuery(event.target.value)}
                />
                {addressQuery ? (
                  <button
                    className="input-shell__clear"
                    onClick={() => setAddressQuery('')}
                    type="button"
                  >
                    <Icon className="input-shell__clear-icon" name="close" />
                    <span className="sr-only">주소 입력 지우기</span>
                  </button>
                ) : null}

                {showAddressResults ? (
                  <div className="search-dropdown search-dropdown--address">
                    <div className="search-dropdown__header">주소 검색 결과</div>
                    <ul className="search-dropdown__list">
                      {filteredAddresses.map((result) => (
                        <li key={result.id}>
                          <button
                            className="search-dropdown__item"
                            onClick={() => setAddressQuery(result.label)}
                            type="button"
                          >
                            <Icon className="search-dropdown__item-icon" name="mapPin" />
                            <span>{result.label}</span>
                            <Icon className="search-dropdown__item-arrow" name="chevronRight" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>

              <button className="button button--soft" onClick={handleCurrentLocation} type="button">
                <Icon className="button__icon" name="spark" />
                <span>현재 위치 자동 감지</span>
              </button>

              <button
                className={`button button--primary button--block ${addressQuery.trim() ? '' : 'is-disabled'}`}
                disabled={!addressQuery.trim()}
                type="submit"
              >
                내 국회의원 찾기
              </button>
            </form>
          ) : (
            <form className="search-form" onSubmit={handleNameSubmit}>
              <label className="field-label" htmlFor="home-name">
                국회의원 이름 검색
              </label>
              <div className="input-shell">
                <Icon className="input-shell__icon" name="searchUser" />
                <input
                  id="home-name"
                  className="input-shell__input"
                  type="text"
                  placeholder="예) 김, 박준혁, 마포구"
                  value={nameQuery}
                  onChange={(event) => setNameQuery(event.target.value)}
                />
                {nameQuery ? (
                  <button
                    className="input-shell__clear"
                    onClick={() => setNameQuery('')}
                    type="button"
                  >
                    <Icon className="input-shell__clear-icon" name="close" />
                    <span className="sr-only">이름 입력 지우기</span>
                  </button>
                ) : null}

                {showNameResults ? (
                  <div className="search-dropdown search-dropdown--members">
                    <div className="search-dropdown__header">{filteredMembers.length}명의 의원</div>
                    <ul className="search-dropdown__list search-dropdown__list--members">
                      {filteredMembers.map((member) => (
                        <li key={member.id}>
                          <button
                            className="search-dropdown__item search-dropdown__item--member"
                            onClick={() => navigate(`/members/${member.id}`)}
                            type="button"
                          >
                            <Avatar member={member} size="sm" />
                            <div className="search-dropdown__member">
                              <div className="search-dropdown__member-head">
                                <strong>{member.name.replace(' 의원', '')}</strong>
                                <span className={`party-badge party-badge--${member.party.tone}`}>
                                  {member.party.name}
                                </span>
                              </div>
                              <span className="search-dropdown__member-meta">{member.district}</span>
                            </div>
                            <Icon className="search-dropdown__item-arrow" name="chevronRight" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>

              {!nameQuery.trim() ? (
                <div className="quick-chip-row">
                  {nameQuickFilters.map((filter) => (
                    <button
                      key={filter.label}
                      className="quick-chip"
                      onClick={() => setNameQuery(filter.query)}
                      type="button"
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>
              ) : null}
            </form>
          )}
        </div>

        <div className="info-card-grid">
          {homeInfoCards.map((card) => (
            <article key={card.id} className="info-card">
              <div className="info-card__icon-wrap">
                <Icon className="info-card__icon" name={card.icon} />
              </div>
              <strong className="info-card__title">{card.title}</strong>
              <p className="info-card__description">{card.description}</p>
            </article>
          ))}
        </div>
      </section>

      <LoginModal
        form={loginForm}
        isOpen={isLoginOpen}
        message={loginMessage}
        onClose={handleLoginClose}
        onFieldChange={handleLoginFieldChange}
        onSubmit={handleLoginSubmit}
      />
    </SiteLayout>
  )
}
