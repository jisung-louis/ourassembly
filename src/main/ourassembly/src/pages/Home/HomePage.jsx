import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './HomePage.css'
import { AuthModal } from '../../components/Common/AuthModal.jsx'
import { Icon } from '../../components/Common/Icon.jsx'
import { SiteLayout, Avatar } from '../../components/Common/Layout.jsx'
import { homeInfoCards, nameQuickFilters } from '../../data/mockData.js'
import { clearAuthSession, getStoredAuthUser } from '../../services/auth.js'
import { searchCongressmenByName } from '../../services/congress.js'
import { searchDistricts } from '../../services/district.js'
import { HomeHeroSection } from '../../components/Home/HomeHeroSection.jsx'

const partyToneRules = [
  { keyword: '국민의힘', tone: 'amber' },
  { keyword: '보수', tone: 'amber' },
  { keyword: '민주', tone: 'green' },
  { keyword: '진보', tone: 'green' },
  { keyword: '개혁', tone: 'green' },
  { keyword: '조국', tone: 'violet' },
  { keyword: '혁신', tone: 'violet' },
]

function getPartyTone(party = '') {
  const matchedRule = partyToneRules.find((rule) => party.includes(rule.keyword))
  return matchedRule?.tone ?? 'violet'
}

function getAvatarTheme(party = '') {
  const tone = getPartyTone(party)

  if (tone === 'green') {
    return 'emerald'
  }

  if (tone === 'amber') {
    return 'amber'
  }

  return 'violet'
}

function getAvatarLabel(name = '') {
  const normalizedName = name.replace(/\s+/g, '').replace(/의원$/, '')
  return normalizedName.slice(0, 2) || '?'
}

function createAvatarMember(member) {
  return {
    avatarLabel: getAvatarLabel(member.congressmanName),
    name: member.congressmanName,
    photoUrl: member.congressmanPhotoUrl,
    theme: getAvatarTheme(member.congressmanParty),
  }
}

function buildSearchFeedback({
  query,
  isLoading,
  error,
  results,
  idleText,
  emptyText,
  loadingText,
}) {
  const normalizedQuery = query.trim()

  if (!normalizedQuery) {
    return null
  }

  if (isLoading) {
    return { tone: 'info', text: loadingText }
  }

  if (error) {
    return { tone: 'error', text: error }
  }

  if (results.length === 0 && normalizedQuery.length >= 2) {
    return { tone: 'muted', text: emptyText }
  }

  if (results.length > 0) {
    return { tone: 'info', text: idleText }
  }

  return null
}

export function HomePage() {
  const navigate = useNavigate()
  const [mode, setMode] = useState('address')
  const [addressQuery, setAddressQuery] = useState('')
  const [nameQuery, setNameQuery] = useState('')
  const [addressResults, setAddressResults] = useState([])
  const [nameResults, setNameResults] = useState([])
  const [addressSearchError, setAddressSearchError] = useState('')
  const [nameSearchError, setNameSearchError] = useState('')
  const [isSearchingAddresses, setIsSearchingAddresses] = useState(false)
  const [isSearchingNames, setIsSearchingNames] = useState(false)
  const [isAuthOpen, setIsAuthOpen] = useState(false)
  const [authMode, setAuthMode] = useState('login')
  const [currentUser, setCurrentUser] = useState(() => getStoredAuthUser())

  useEffect(() => {
    if (mode !== 'address') {
      return undefined
    }

    const normalizedQuery = addressQuery.trim()

    if (!normalizedQuery) {
      setAddressResults([])
      setAddressSearchError('')
      setIsSearchingAddresses(false)
      return undefined
    }

    let ignore = false
    const timeoutId = window.setTimeout(async () => {
      setIsSearchingAddresses(true)
      setAddressSearchError('')

      try {
        const districts = await searchDistricts(normalizedQuery, 10)

        if (!ignore) {
          setAddressResults(districts)
        }
      } catch (error) {
        if (!ignore) {
          setAddressResults([])
          setAddressSearchError(error.message)
        }
      } finally {
        if (!ignore) {
          setIsSearchingAddresses(false)
        }
      }
    }, 250)

    return () => {
      ignore = true
      window.clearTimeout(timeoutId)
    }
  }, [addressQuery, mode])

  useEffect(() => {
    if (mode !== 'name') {
      return undefined
    }

    const normalizedQuery = nameQuery.trim()

    if (!normalizedQuery) {
      setNameResults([])
      setNameSearchError('')
      setIsSearchingNames(false)
      return undefined
    }

    let ignore = false
    const timeoutId = window.setTimeout(async () => {
      setIsSearchingNames(true)
      setNameSearchError('')

      try {
        const congressmen = await searchCongressmenByName(normalizedQuery)

        if (!ignore) {
          setNameResults(congressmen)
        }
      } catch (error) {
        if (!ignore) {
          setNameResults([])
          setNameSearchError(error.message)
        }
      } finally {
        if (!ignore) {
          setIsSearchingNames(false)
        }
      }
    }, 250)

    return () => {
      ignore = true
      window.clearTimeout(timeoutId)
    }
  }, [mode, nameQuery])

  const showAddressResults =
    mode === 'address' && addressQuery.trim().length > 0 && addressResults.length > 0
  const showNameResults = mode === 'name' && nameQuery.trim().length > 0 && nameResults.length > 0
  const addressFeedback = buildSearchFeedback({
    query: addressQuery,
    isLoading: isSearchingAddresses,
    error: addressSearchError,
    results: addressResults,
    idleText: '검색 결과를 누르거나, 제출하면 첫 번째 지역구로 이동합니다.',
    emptyText: '일치하는 주소를 찾지 못했습니다.',
    loadingText: '주소를 검색하는 중입니다.',
  })
  const nameFeedback = buildSearchFeedback({
    query: nameQuery,
    isLoading: isSearchingNames,
    error: nameSearchError,
    results: nameResults,
    idleText: '검색 결과를 누르거나, 제출하면 첫 번째 의원 상세 페이지로 이동합니다.',
    emptyText: '일치하는 국회의원을 찾지 못했습니다.',
    loadingText: '국회의원 이름을 검색하는 중입니다.',
  })
  const actions = currentUser
    ? [
        {
          id: 'logout',
          icon: 'close',
          label: '로그아웃',
          onClick: () => {
            clearAuthSession()
            setCurrentUser(null)
            setAuthMode('login')
          },
        },
      ]
    : [
        {
          id: 'signup',
          label: '회원가입',
          onClick: () => {
            setAuthMode('signup')
            setIsAuthOpen(true)
          },
        },
        {
          id: 'login',
          icon: 'user',
          label: '로그인',
          onClick: () => {
            setAuthMode('login')
            setIsAuthOpen(true)
          },
          variant: 'primary',
        },
      ]

  function navigateToCongressman(congressmanId) {
    navigate(`/members/${congressmanId}`)
  }

  function handleAddressSubmit(event) {
    event.preventDefault()

    if (!addressQuery.trim()) {
      return
    }

    const firstMatch = addressResults[0]

    if (!firstMatch?.congressmanId) {
      setAddressSearchError('해당 주소의 국회의원 정보를 찾지 못했습니다.')
      return
    }

    navigateToCongressman(firstMatch.congressmanId)
  }

  function handleNameSubmit(event) {
    event.preventDefault()

    if (!nameQuery.trim()) {
      return
    }

    const firstMatch = nameResults[0]

    if (!firstMatch?.congressmanId) {
      setNameSearchError('해당 이름의 국회의원을 찾지 못했습니다.')
      return
    }

    navigateToCongressman(firstMatch.congressmanId)
  }

  function handleCurrentLocation() {
    setMode('address')
    setAddressQuery('잠실동')
  }

  return (
    <SiteLayout actions={actions} pageClassName="page page--home">
      <HomeHeroSection />

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
                  placeholder="예) 잠실동, 성산동, 송도5동"
                  value={addressQuery}
                  onChange={(event) => {
                    setAddressQuery(event.target.value)
                    setAddressSearchError('')
                  }}
                />
                {addressQuery ? (
                  <button
                    className="input-shell__clear"
                    onClick={() => {
                      setAddressQuery('')
                      setAddressSearchError('')
                    }}
                    type="button"
                  >
                    <Icon className="input-shell__clear-icon" name="close" />
                    <span className="sr-only">주소 입력 지우기</span>
                  </button>
                ) : null}

                {showAddressResults ? (
                  <div className="search-dropdown search-dropdown--address">
                    <div className="search-dropdown__header">{addressResults.length}개의 주소</div>
                    <ul className="search-dropdown__list">
                      {addressResults.map((result) => (
                        <li key={result.id}>
                          <button
                            className="search-dropdown__item search-dropdown__item--member"
                            onClick={() => navigateToCongressman(result.congressmanId)}
                            type="button"
                          >
                            <Icon className="search-dropdown__item-icon" name="mapPin" />
                            <div className="search-dropdown__member">
                              <div className="search-dropdown__member-head">
                                <strong>{result.fullAddress}</strong>
                              </div>
                              <span className="search-dropdown__member-meta">
                                {result.congressmanName ?? '담당 국회의원 정보 없음'}
                                {result.congressmanWard ? ` · ${result.congressmanWard}` : ''}
                              </span>
                            </div>
                            <Icon className="search-dropdown__item-arrow" name="chevronRight" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>

              {addressFeedback ? (
                <p className={`search-form__feedback ${addressFeedback.tone === 'error' ? 'is-error' : ''}`}>
                  {addressFeedback.text}
                </p>
              ) : null}

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
                  placeholder="예) 김, 박준혁"
                  value={nameQuery}
                  onChange={(event) => {
                    setNameQuery(event.target.value)
                    setNameSearchError('')
                  }}
                />
                {nameQuery ? (
                  <button
                    className="input-shell__clear"
                    onClick={() => {
                      setNameQuery('')
                      setNameSearchError('')
                    }}
                    type="button"
                  >
                    <Icon className="input-shell__clear-icon" name="close" />
                    <span className="sr-only">이름 입력 지우기</span>
                  </button>
                ) : null}

                {showNameResults ? (
                  <div className="search-dropdown search-dropdown--members">
                    <div className="search-dropdown__header">{nameResults.length}명의 의원</div>
                    <ul className="search-dropdown__list search-dropdown__list--members">
                      {nameResults.map((member) => (
                        <li key={member.congressmanId}>
                          <button
                            className="search-dropdown__item search-dropdown__item--member"
                            onClick={() => navigateToCongressman(member.congressmanId)}
                            type="button"
                          >
                            <Avatar member={createAvatarMember(member)} size="sm" />
                            <div className="search-dropdown__member">
                              <div className="search-dropdown__member-head">
                                <strong>{member.congressmanName}</strong>
                                <span
                                  className={`party-badge party-badge--${getPartyTone(member.congressmanParty)}`}
                                >
                                  {member.congressmanParty ?? '정당 정보 없음'}
                                </span>
                              </div>
                              <span className="search-dropdown__member-meta">
                                {member.congressmanWard ?? '지역구 정보 없음'}
                              </span>
                            </div>
                            <Icon className="search-dropdown__item-arrow" name="chevronRight" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>

              {nameFeedback ? (
                <p className={`search-form__feedback ${nameFeedback.tone === 'error' ? 'is-error' : ''}`}>
                  {nameFeedback.text}
                </p>
              ) : null}

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

      <AuthModal
        key={`${isAuthOpen ? 'open' : 'closed'}-${authMode}`}
        initialMode={authMode}
        isOpen={isAuthOpen}
        onAuthSuccess={(user) => setCurrentUser(user)}
        onClose={() => setIsAuthOpen(false)}
      />
    </SiteLayout>
  )
}
