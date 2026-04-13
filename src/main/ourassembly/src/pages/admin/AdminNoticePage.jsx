// AdminNoticePage.jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getStoredAuthUser } from '../../services/auth.js'
import { sendPushNotification } from '../../services/communityApi.js'
import './AdminDashboard.css'
import './AdminNoticePage.css'

export function AdminNoticePage() {
    const navigate = useNavigate()
    const [title, setTitle] = useState('')
    const [message, setMessage] = useState('')
    const [isSending, setIsSending] = useState(false)

    const handleSend = async () => {
        if (!title || !message) return alert('제목과 내용을 입력해주세요.')
        if (!window.confirm('모든 사용자에게 즉시 알림을 보낼까요?')) return

        setIsSending(true)
        try {
            await sendPushNotification({ title, message })
            alert('파이어베이스 알림 전송 성공!')
            setTitle('')
            setMessage('')
        } catch (e) {
            alert(e.message)
        } finally {
            setIsSending(false)
        }
    }

    return (
        <div className="admin-wrap">
            <div className="admin-sidebar">
                <div className="admin-sidebar__logo">
                    <div className="admin-sidebar__logo-dot" />
                    우리동네 국회의원
                </div>
                <div className="admin-nav-item" onClick={() => navigate('/admin')}>대시보드</div>
                <div className="admin-nav-item" onClick={() => navigate('/community')}>커뮤니티</div>
                <div className="admin-nav-item active">공지사항 관리</div>
                <div className="admin-nav-item" onClick={() => navigate('/')}>홈으로</div>
            </div>

            <div className="admin-main">
                <div className="notice-manage-container">

                    <header className="notice-header">
                        <h2>공지사항 알림</h2>
                    </header>

                    <div className="notice-card">
                        <div className="input-group">
                            <label className="input-label">글 제목</label>
                            <input
                                className="notice-input"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}

                            />
                        </div>

                        <div className="input-group">
                            <label className="input-label">메세지 내용</label>
                            <textarea
                                className="notice-textarea"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                            />
                        </div>

                        <button className="send-btn" onClick={handleSend} disabled={isSending}>
                            {isSending ? '전송 중...' : '전송하기'}
                        </button>

                        <div className="notice-footer-info">
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}