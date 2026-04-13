import React from 'react'
import { unfollowMember } from '../../../services/communityApi.js'

export function FollowList({ follows, onUnfollow }) {
  const handleUnfollow = async (congressmanId) => {
    if (!window.confirm('팔로우를 취소 하시겠습니까?')) return
    try {
      await unfollowMember(congressmanId)
      onUnfollow(congressmanId)
    } catch (e) {
      alert('팔로우 취소에 실패했습니다.')
    }
  }

  return (
    <div className="follow-list-container">
      {follows && follows.length > 0 ? (
        <ul className="comm-list" style={{ listStyle: 'none', padding: 0 }}>
          {follows.map((member) => (
            <li key={member.congressmanId} style={{
              display: 'flex',
              alignItems: 'center',
              padding: '15px',
              borderBottom: '1px solid #eee'
            }}>
              <div style={{
                width: '55px', height: '55px', borderRadius: '50%',
                overflow: 'hidden', marginRight: '15px', backgroundColor: '#f0f0f0'
              }}>
                <img
                  src={member.photoUrl || '/default-member.png'}
                  alt={member.congressmanName}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 'bold', fontSize: '17px', color: '#333' }}>
                  {member.congressmanName} 의원
                </div>
                <div style={{ fontSize: '14px', color: '#777', marginTop: '4px' }}>
                  {member.party ?? '-'} | {member.ward ?? '-'}
                </div>
              </div>

              <button
                type="button"
                style={{
                  padding: '6px 16px',
                  borderRadius: '30px',
                  fontSize: '0.85rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  border: 'none',
                  transition: 'all 0.3s',
                  backgroundColor: '#2563eb',
                  color: '#fff',
                  boxShadow: '0 2px 4px rgba(37, 99, 235, 0.2)'
                }}
                onClick={() => handleUnfollow(member.congressmanId)}
              >
                ✓ 팔로잉
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#bbb' }}>
          현재 팔로우 중인 국회의원이 없습니다.
        </div>
      )}
    </div>
  )
}