import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchMyInfo, fetchMyBoards, fetchMyReplies, fetchMyGifts, fetchMyPoint } from '../../services/communityApi.js'
import { getStoredAuthUser } from '../../services/auth.js'
import { UserInfoCard } from '../../components/Community/MyPage/UserInfoCard.jsx'
import { TabSelector } from '../../components/Community/MyPage/TabSelector.jsx'
import { MyBoardList } from '../../components/Community/MyPage/MyBoardList.jsx'
import { MyReplyList } from '../../components/Community/MyPage/MyReplyList.jsx'
import { MyGiftList } from '../../components/Community/MyPage/MyGiftList.jsx'

export function MyPagePage() {
    const navigate = useNavigate()
    const currentUser = getStoredAuthUser()
    const [userInfo, setUserInfo] = useState(null)
    const [myBoards, setMyBoards] = useState([])
    const [myReplies, setMyReplies] = useState([])
    const [myGifts, setMyGifts] = useState([])
    const [myPoint, setMyPoint] = useState(0)
    const [activeTab, setActiveTab] = useState('boards')
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        if (!currentUser) { alert('로그인이 필요합니다.'); navigate('/community'); return }
        setIsLoading(true)

        Promise.allSettled([
            fetchMyInfo(),
            fetchMyBoards(),
            fetchMyReplies(),
            fetchMyGifts(),
            fetchMyPoint()
        ])
            .then(([i, b, r, g, p]) => {
                if (i.status === 'fulfilled') setUserInfo(i.value)
                if (b.status === 'fulfilled') setMyBoards(b.value || [])
                if (r.status === 'fulfilled') setMyReplies(r.value || [])
                if (g.status === 'fulfilled') setMyGifts(Array.isArray(g.value) ? g.value : [])
                if (p.status === 'fulfilled') setMyPoint(p.value || 0)
            })
            .finally(() => setIsLoading(false))
    }, [navigate, currentUser])

    if (isLoading) return <div className="comm-loading"><div className="comm-spinner" /><span>내 정보를 불러오는 중...</span></div>

    return (
        <>
            <UserInfoCard userInfo={userInfo} point={myPoint} />
            <TabSelector
                activeTab={activeTab}
                onTabChange={setActiveTab}
                boardCount={myBoards.length}
                replyCount={myReplies.length}
                giftCount={myGifts.length}
            />
            <div className="mypage-content" style={{ marginTop: '20px' }}>
                {activeTab === 'boards' && <MyBoardList boards={myBoards} />}
                {activeTab === 'replies' && <MyReplyList replies={myReplies} />}
                {activeTab === 'gifts' && <MyGiftList gifts={myGifts} />}
            </div>
        </>
    )
}