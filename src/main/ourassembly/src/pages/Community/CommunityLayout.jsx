import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { SiteLayout } from '../../components/Common/Layout.jsx'
import { MainPage } from './MainPage.jsx'
import { DetailPage } from './DetailPage.jsx'
import { WritePage } from './WritePage.jsx'
import { ShopPage } from './ShopPage.jsx'
import { MyPagePage } from './MyPagePage.jsx'
import './Community.css'
import { clearAuthSession, getStoredAuthUser } from '../../services/auth.js'
import { AuthModal } from '../../components/Common/AuthModal.jsx'
import { useState } from 'react'

const navTabs = [
  { path: '/community', label: '게시판', match: (p) => p === '/community' || p.startsWith('/community?') },
  { path: '/community/shop', label: '포인트샵', match: (p) => p.startsWith('/community/shop') },
  { path: '/community/mypage', label: '마이페이지', match: (p) => p.startsWith('/community/mypage') },
]

export function CommunityLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const [currentUser, setCurrentUser] = useState(() => getStoredAuthUser())
  const [isAuthOpen, setIsAuthOpen] = useState(false)
  const [authMode, setAuthMode] = useState('login')

  const headerGreeting = currentUser ? `${currentUser.name ?? '사용자'}님 환영합니다` : ''

  const actions = [
    { to: '/', icon: 'arrowLeft', label: '홈으로' },
    ...(currentUser
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
                variant: 'primary',
                onClick: () => { setAuthMode('login'); setIsAuthOpen(true) },
              },
            ]
    ),
  ]

  const hideNav =
      location.pathname.startsWith('/community/write') ||
      location.pathname.startsWith('/community/edit') ||
      /^\/community\/board\/\d+/.test(location.pathname)

  return (
      <SiteLayout actions={actions} headerGreeting={headerGreeting} pageClassName="page">
        <div className="comm-shell">
          <h1>커뮤니티</h1>
          <p className="page-desc">지역 주민들과 자유롭게 의견을 나누고, 포인트를 모아 상품을 교환하세요.</p>

          {!hideNav && (
              <div className="comm-nav">
                {navTabs.map((tab) => (
                    <button key={tab.path}
                            className={`comm-nav__tab ${tab.match(location.pathname) ? 'is-active' : ''}`}
                            onClick={() => navigate(tab.path)} type="button">
                      {tab.label}
                    </button>
                ))}
              </div>
          )}

          <Routes>
            <Route index element={<MainPage />} />
            <Route path="board/:boardId" element={<DetailPage />} />
            <Route path="write" element={<WritePage />} />
            <Route path="edit/:boardId" element={<WritePage />} />
            <Route path="shop" element={<ShopPage />} />
            <Route path="mypage" element={<MyPagePage />} />
          </Routes>
        </div>

        <AuthModal
            key={`${isAuthOpen ? 'open' : 'closed'}-${authMode}`}
            initialMode={authMode}
            isOpen={isAuthOpen}
            onAuthSuccess={(user) => { setCurrentUser(user); setIsAuthOpen(false) }}
            onClose={() => setIsAuthOpen(false)}
        />
      </SiteLayout>
  )
}