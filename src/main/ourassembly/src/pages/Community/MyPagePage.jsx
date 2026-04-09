import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { fetchMyInfo, fetchMyBoards, fetchMyReplies } from '../../services/communityApi.js'
import { getStoredAuthUser, getAuthorizationHeader } from '../../services/auth.js'
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
    const [activeTab, setActiveTab] = useState('boards')
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        if (!currentUser) { alert('로그인이 필요합니다.'); navigate('/community'); return }
        setIsLoading(true)

        const token = getAuthorizationHeader()

        Promise.allSettled([
            fetchMyInfo(),
            fetchMyBoards(),
            fetchMyReplies(),
            axios.get('http://localhost:8080/api/user/mygift', {
                headers: { Authorization: token }
            })
        ])
            .then(([i, b, r, g]) => {
                if (i.status === 'fulfilled') setUserInfo(i.value)
                if (b.status === 'fulfilled') setMyBoards(b.value || [])
                if (r.status === 'fulfilled') setMyReplies(r.value || [])
                if (g.status === 'fulfilled') {
                    const data = Array.isArray(g.value.data) ? g.value.data : []
                    setMyGifts(data)
                }
            })
            .finally(() => setIsLoading(false))
    }, [navigate, currentUser])

    if (isLoading) return <div className="comm-loading"><div className="comm-spinner" /><span>내 정보를 불러오는 중...</span></div>

    return (
        <>
            <UserInfoCard userInfo={userInfo} />
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