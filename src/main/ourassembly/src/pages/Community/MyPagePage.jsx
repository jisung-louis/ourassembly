import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchMyInfo, fetchMyBoards, fetchMyReplies, fetchMyGifts, fetchMyPoint,fetchMyFollows } from '../../services/communityApi.js'
import { clearAuthSession, getStoredAuthUser } from '../../services/auth.js'
import { SiteLayout } from '../../components/Common/Layout.jsx'
import { UserInfoCard } from '../../components/Community/MyPage/UserInfoCard.jsx'
import { TabSelector } from '../../components/Community/MyPage/TabSelector.jsx'
import { MyBoardList } from '../../components/Community/MyPage/MyBoardList.jsx'
import { MyReplyList } from '../../components/Community/MyPage/MyReplyList.jsx'
import { MyGiftList } from '../../components/Community/MyPage/MyGiftList.jsx'
import { FollowList } from '../../components/Community/MyPage/FollowList.jsx'

export function MyPagePage() {
    const navigate = useNavigate()
    const [currentUser, setCurrentUser] = useState(() => getStoredAuthUser())
    const [userInfo, setUserInfo] = useState(null)
    const [myBoards, setMyBoards] = useState([])
    const [myReplies, setMyReplies] = useState([])
    const [myFollows, setMyFollows] = useState([])
    const [myGifts, setMyGifts] = useState([])
    const [myPoint, setMyPoint] = useState(0)
    const [activeTab, setActiveTab] = useState('boards')
    const [isLoading, setIsLoading] = useState(true)

    const headerGreeting = currentUser ? `${currentUser.name ?? '사용자'}님 환영합니다` : ''
    const actions = [
        { to: '/', icon: 'arrowLeft', label: '홈으로' },
        { to: '/community', label: '커뮤니티', variant: 'ghost' },
        ...(currentUser
                ? [{
                    id: 'logout',
                    icon: 'close',
                    label: '로그아웃',
                    onClick: () => { clearAuthSession(); setCurrentUser(null); navigate('/') },
                }]
                : []
        ),
    ]

    useEffect(() => {
        if (!currentUser) { alert('로그인이 필요합니다.'); navigate('/'); return }
        setIsLoading(true)

        Promise.allSettled([
            fetchMyInfo(),
            fetchMyBoards(),
            fetchMyReplies(),
            fetchMyGifts(),
            fetchMyPoint(),
            fetchMyFollows()
        ])
            .then(([i, b, r, g, p,f]) => {
                if (i.status === 'fulfilled') setUserInfo(i.value)
                if (b.status === 'fulfilled') setMyBoards(b.value || [])
                if (r.status === 'fulfilled') setMyReplies(r.value || [])
                if (g.status === 'fulfilled') setMyGifts(Array.isArray(g.value) ? g.value : [])
                if (p.status === 'fulfilled') setMyPoint(p.value || 0)
                if (f.status === 'fulfilled') setMyFollows(f.value || [])
            })
            .finally(() => setIsLoading(false))
    }, [navigate, currentUser])

    if (isLoading) return (
        <SiteLayout actions={actions} headerGreeting={headerGreeting} pageClassName="page">
            <div className="comm-loading"><div className="comm-spinner" /><span>내 정보를 불러오는 중...</span></div>
        </SiteLayout>
    )

    return (
        <SiteLayout actions={actions} headerGreeting={headerGreeting} pageClassName="page">
            <div className="comm-shell">
                <h1>마이페이지</h1>
                <UserInfoCard userInfo={userInfo} point={myPoint} />
                <TabSelector
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                    boardCount={myBoards.length}
                    replyCount={myReplies.length}
                    giftCount={myGifts.length}
                    followCount={myFollows.length}
                />
                <div className="mypage-content" style={{ marginTop: '20px' }}>
                    {activeTab === 'boards' && <MyBoardList boards={myBoards} />}
                    {activeTab === 'replies' && <MyReplyList replies={myReplies} />}
                    {activeTab === 'gifts' && <MyGiftList gifts={myGifts} />}
                   {activeTab === 'follows' && (
                     <FollowList
                       follows={myFollows}
                       onUnfollow={(id) => setMyFollows(prev => prev.filter(f => f.congressmanId !== id))}
                     />
                   )}
                </div>
            </div>
        </SiteLayout>
    )
}