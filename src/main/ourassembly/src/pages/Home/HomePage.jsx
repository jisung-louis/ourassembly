import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './HomePage.css'
import { AuthModal } from '../../components/Common/AuthModal.jsx'
import { SiteLayout } from '../../components/Common/Layout.jsx'
import { HomeHeroSection } from '../../components/Home/HomeHeroSection.jsx'
import { SearchPanel } from '../../components/Home/SearchPanel.jsx'
import { InfoCardGrid } from '../../components/Home/InfoCardGrid.jsx'
import { clearAuthSession, getStoredAuthUser } from '../../services/auth.js'
import { searchCongressmenByName } from '../../services/congress.js'
import { searchDistricts } from '../../services/district.js'

function buildSearchFeedback({ query, isLoading, error, results, idleText, emptyText, loadingText }) {
  const normalizedQuery = query.trim()
  if (!normalizedQuery) return null
  if (isLoading) return { tone: 'info', text: loadingText }
  if (error) return { tone: 'error', text: error }
  if (results.length === 0 && normalizedQuery.length >= 2) return { tone: 'muted', text: emptyText }
  if (results.length > 0) return { tone: 'info', text: idleText }
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
    if (mode !== 'address' || !addressQuery.trim()) {
      setAddressResults([])
      setAddressSearchError('')
      setIsSearchingAddresses(false)
      return
    }
    let ignore = false
    const id = window.setTimeout(async () => {
      setIsSearchingAddresses(true)
      try {
        const districts = await searchDistricts(addressQuery.trim(), 10)
        if (!ignore) setAddressResults(districts)
      } catch (e) {
        if (!ignore) { setAddressResults([]); setAddressSearchError(e.message) }
      } finally {
        if (!ignore) setIsSearchingAddresses(false)
      }
    }, 250)
    return () => { ignore = true; window.clearTimeout(id) }
  }, [addressQuery, mode])

  useEffect(() => {
    if (mode !== 'name' || !nameQuery.trim()) {
      setNameResults([])
      setNameSearchError('')
      setIsSearchingNames(false)
      return
    }
    let ignore = false
    const id = window.setTimeout(async () => {
      setIsSearchingNames(true)
      try {
        const congressmen = await searchCongressmenByName(nameQuery.trim())
        if (!ignore) setNameResults(congressmen)
      } catch (e) {
        if (!ignore) { setNameResults([]); setNameSearchError(e.message) }
      } finally {
        if (!ignore) setIsSearchingNames(false)
      }
    }, 250)
    return () => { ignore = true; window.clearTimeout(id) }
  }, [mode, nameQuery])

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
      ? [{
        id: 'logout',
        icon: 'close',
        label: '로그아웃',
        onClick: () => { clearAuthSession(); setCurrentUser(null) },
      }]
      : [
        {
          id: 'signup',
          label: '회원가입',
          onClick: () => { setAuthMode('signup'); setIsAuthOpen(true) },
        },
        {
          id: 'login',
          icon: 'user',
          label: '로그인',
          onClick: () => { setAuthMode('login'); setIsAuthOpen(true) },
          variant: 'primary',
        },
      ]

  function navigateToMember(id) {
    navigate(`/members/${id}`)
  }

  function handleAddressSubmit(e) {
    e.preventDefault()
    if (!addressQuery.trim()) return
    const first = addressResults[0]
    if (!first?.congressmanId) {
      setAddressSearchError('해당 주소의 국회의원 정보를 찾지 못했습니다.')
      return
    }
    navigateToMember(first.congressmanId)
  }

  function handleNameSubmit(e) {
    e.preventDefault()
    if (!nameQuery.trim()) return
    const first = nameResults[0]
    if (!first?.congressmanId) {
      setNameSearchError('해당 이름의 국회의원을 찾지 못했습니다.')
      return
    }
    navigateToMember(first.congressmanId)
  }

  return (
      <SiteLayout actions={actions} pageClassName="page page--home">
        <HomeHeroSection />

        <section className="home-search">
          <SearchPanel
              mode={mode}
              onModeChange={setMode}
              addressQuery={addressQuery}
              addressResults={addressResults}
              addressFeedback={addressFeedback}
              onAddressQueryChange={(v) => { setAddressQuery(v); setAddressSearchError('') }}
              onAddressSubmit={handleAddressSubmit}
              onAddressSelect={navigateToMember}
              onCurrentLocation={() => { setMode('address'); setAddressQuery('잠실동') }}
              nameQuery={nameQuery}
              nameResults={nameResults}
              nameFeedback={nameFeedback}
              onNameQueryChange={(v) => { setNameQuery(v); setNameSearchError('') }}
              onNameSubmit={handleNameSubmit}
              onNameSelect={navigateToMember}
          />
          <InfoCardGrid />
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