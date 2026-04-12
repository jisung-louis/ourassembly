import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getStoredAuthUser, clearAuthSession } from '../../services/auth.js'
import { fetchAdminStats, fetchAdminCommunity, fetchAdminUsers, fetchAdminPoints, fetchAdminOpinions, syncBill, syncNews } from '../../services/communityApi.js'
import { StatCard } from '../../components/Admin/StatCard.jsx'
import { CommunitySection } from '../../components/Admin/CommunitySection.jsx'
import { UserSection } from '../../components/Admin/UserSection.jsx'
import { PointSection } from '../../components/Admin/PointSection.jsx'
import { OpinionSection } from '../../components/Admin/OpinionSection.jsx'
import './AdminDashboard.css'

export function AdminDashboardPage() {
    const navigate = useNavigate()
    const [currentUser] = useState(() => getStoredAuthUser())
    const [stats, setStats] = useState(null)
    const [community, setCommunity] = useState(null)
    const [users, setUsers] = useState(null)
    const [points, setPoints] = useState(null)
    const [opinions, setOpinions] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isSyncing, setIsSyncing] = useState(false)

    useEffect(() => {
        if (!currentUser || currentUser.role !== 'admin') {
            alert('관리자만 접근 가능합니다.')
            navigate('/')
            return
        }
        setIsLoading(true)
        Promise.allSettled([
            fetchAdminStats(),
            fetchAdminCommunity(),
            fetchAdminUsers(),
            fetchAdminPoints(),
            fetchAdminOpinions()
        ])
            .then(([s, c, u, p, o]) => {
                if (s.status === 'fulfilled') setStats(s.value)
                if (c.status === 'fulfilled') setCommunity(c.value)
                if (u.status === 'fulfilled') setUsers(u.value)
                if (p.status === 'fulfilled') setPoints(p.value)
                if (o.status === 'fulfilled') setOpinions(o.value)
            })
            .finally(() => setIsLoading(false))
    }, [navigate])

    const handleSyncBill = async () => {
        if (isSyncing) return
        if (!window.confirm('법안 동기화를 실행하시겠습니까? 시간이 오래 걸릴 수 있습니다.')) return
        setIsSyncing(true)
        try {
            await syncBill()
            alert('법안 동기화 완료')
        } catch (e) {
            alert(e.message)
        } finally {
            setIsSyncing(false)
        }
    }

    const handleSyncNews = async () => {
        if (isSyncing) return
        if (!window.confirm('뉴스 크롤링을 실행하시겠습니까? 시간이 오래 걸릴 수 있습니다.')) return
        setIsSyncing(true)
        try {
            await syncNews()
            alert('뉴스 크롤링 완료')
        } catch (e) {
            alert(e.message)
        } finally {
            setIsSyncing(false)
        }
    }

    if (isLoading) return (
        <div className="admin-loading">
            <div className="comm-spinner" />
            <span>불러오는 중...</span>
        </div>
    )

    return (
        <div className="admin-wrap">
            {/* 사이드바 */}
            <div className="admin-sidebar">
                <div className="admin-sidebar__logo">
                    <div className="admin-sidebar__logo-dot" />
                    우리동네 국회의원
                </div>
                <div className="admin-nav-item active">대시보드</div>
                <div className="admin-nav-item" onClick={() => navigate('/community')}>커뮤니티</div>
                <div className="admin-nav-item" onClick={() => navigate('/')}>홈으로</div>
                <div className="admin-sidebar__bottom">
                    <div className="admin-sidebar__user">{currentUser?.name}님</div>
                    <button className="admin-logout-btn" onClick={() => { clearAuthSession(); navigate('/') }}>
                        로그아웃
                    </button>
                </div>
            </div>

            {/* 메인 */}
            <div className="admin-main">
                <div className="admin-page-title">대시보드</div>

                {/* 동기화 버튼 */}
                <div className="admin-sync-row">
                    <button
                        className="admin-sync-btn admin-sync-btn--green"
                        onClick={handleSyncBill}
                        disabled={isSyncing}
                    >
                        {isSyncing ? '동기화 중...' : '⟳ 법안 동기화'}
                    </button>
                    <button
                        className="admin-sync-btn admin-sync-btn--blue"
                        onClick={handleSyncNews}
                        disabled={isSyncing}
                    >
                        {isSyncing ? '동기화 중...' : '⟳ 뉴스 크롤링'}
                    </button>
                </div>

                <StatCard data={stats} />
                <div className="admin-section-grid">
                    <CommunitySection data={community} />
                    <UserSection data={users} />
                    <PointSection data={points} />
                    <OpinionSection data={opinions} />
                </div>
            </div>
        </div>
    )
}