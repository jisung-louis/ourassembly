import React, { useState } from 'react'
import { requestToken } from '../../firebase.js'
import { getAuthSession } from '../../services/auth.js'
import { apiClient } from '../../services/apiClient.js'

export function NotificationBell({ unreadCount = 0, onRead }) {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState([])

  const handleBellClick = async () => {
    const session = getAuthSession()
    if (!session?.token) return

    if (!isOpen) {
      try {
        const res = await apiClient.get('/api/notification', {
          headers: { Authorization: `Bearer ${session.token}` }
        })
        setNotifications(res.data)
      } catch (e) {
        console.error('알림 목록 조회 실패', e)
      }

      try {
        await apiClient.patch('/api/notification/read-all', {}, {
          headers: { Authorization: `Bearer ${session.token}` }
        })
        onRead?.()
      } catch (e) {
        console.error('읽음 처리 실패', e)
      }
    }

    setIsOpen(prev => !prev)
  }

  const handleDeleteOne = async (id) => {
    const session = getAuthSession()
    if (!session?.token) return

    try {
      await apiClient.delete(`/api/notification/${id}`, {
        headers: { Authorization: `Bearer ${session.token}` }
      })
      setNotifications(prev => prev.filter(n => n.id !== id))
    } catch (e) {
      console.error('알림 삭제 실패', e)
    }
  }

  const handleDeleteAll = async () => {
    const session = getAuthSession()
    if (!session?.token) return

    try {
      await apiClient.delete('/api/notification', {
        headers: { Authorization: `Bearer ${session.token}` }
      })
      setNotifications([])
    } catch (e) {
      console.error('전체 삭제 실패', e)
    }
  }

  return (
    <div style={{ position: 'relative' }}>
      <span
        className="notification-bell"
        onClick={handleBellClick}
        style={{
          position: 'relative',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '32px',
          height: '32px',
          cursor: 'pointer',
          verticalAlign: 'middle'
        }}
      >
        <svg
          width="24" height="24" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          style={{ display: 'block' }}
        >
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
        </svg>

        {unreadCount > 0 && (
          <span style={{
            position: 'absolute', top: '-2px', right: '-2px',
            backgroundColor: '#ff4d4f', color: 'white',
            fontSize: '11px', fontWeight: 'bold',
            minWidth: '18px', height: '18px', borderRadius: '999px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '2px solid white', padding: '0 4px', zIndex: 10, lineHeight: 1
          }}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </span>

      {isOpen && (
        <div style={{
          position: 'absolute', top: '40px', right: '0',
          width: '300px', maxHeight: '400px', overflowY: 'auto',
          backgroundColor: 'white', borderRadius: '8px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
          zIndex: 100, border: '1px solid #eee'
        }}>
          <div style={{
            padding: '12px 16px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            borderBottom: '1px solid #eee'
          }}>
            <span style={{ fontWeight: 'bold' }}>알림</span>
            {notifications.length > 0 && (
              <button
                onClick={handleDeleteAll}
                style={{
                  fontSize: '12px', color: '#999', cursor: 'pointer',
                  background: 'none', border: 'none', padding: '0'
                }}
              >
                전체 삭제
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: '#999' }}>
              알림이 없습니다.
            </div>
          ) : (
            notifications.map((n) => (
              <div key={n.id} style={{
                padding: '12px 16px',
                borderBottom: '1px solid #f0f0f0',
                fontSize: '14px',
                display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between'
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>{n.title}</div>
                  <div style={{ color: '#555' }}>{n.message}</div>
                  <div style={{ color: '#999', fontSize: '12px', marginTop: '4px' }}>
                    {n.createdAt ? new Date(n.createdAt).toLocaleString('ko-KR') : ''}
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteOne(n.id)}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: '#ccc', fontSize: '16px', padding: '0 0 0 8px', lineHeight: 1
                  }}
                >
                  ✕
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}