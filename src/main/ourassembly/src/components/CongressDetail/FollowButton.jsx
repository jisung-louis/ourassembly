import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getAuthorizationHeader } from '../../services/auth.js';

const FollowButton = ({ memberId }) => {
    const [isFollowing, setIsFollowing] = useState(false);
    const [followerCount, setFollowerCount] = useState(0); // 서버에서 숫자를 안주면 일단 0

    useEffect(() => {
        const checkInitialFollow = async () => {
            const authHeader = getAuthorizationHeader();
            if (!authHeader || !memberId) return;

            try {
                // 서버의 GET /api/follow (목록 조회)를 활용해 내가 이 의원을 팔로우 중인지 확인
                const res = await axios.get('/api/follow', { headers: { Authorization: authHeader } });
                const myFollows = res.data; // 서버가 리스트를 준다고 가정
                const following = myFollows.some(f => String(f.congressmanId) === String(memberId));
                setIsFollowing(following);
            } catch (err) {
                console.error("초기 상태 로드 실패:", err);
            }
        };
        checkInitialFollow();
    }, [memberId]);

    const handleFollow = async () => {
        const authHeader = getAuthorizationHeader();
        if (!authHeader) return alert('로그인이 필요합니다.');

        try {
            const config = { headers: { Authorization: authHeader } };
            
            if (isFollowing) {
              console.log("보내는 의원 ID:", memberId);
                await axios.delete(`http://localhost:8080/api/follow/${memberId}`, config);
                setIsFollowing(false);
                setFollowerCount(prev => Math.max(0, prev - 1));
            } else {
                // POST 호출
                // 서버가 "팔로우 성공" 문자열을 주므로 res.data를 객체처럼 쓰면 안됨
                await axios.post(`http://localhost:8080/api/follow/${memberId}`, {}, config);
                setIsFollowing(true);
                setFollowerCount(prev => prev + 1);
            }
        } catch (err) {
            console.error("에러 상세:", err.response);
            if (err.response?.status === 409) {
                alert("이미 팔로우 중인 의원입니다.");
                setIsFollowing(true);
            } else {
                alert('처리 중 오류가 발생했습니다. (네트워크 탭을 확인하세요)');
            }
        }
    };

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
                onClick={handleFollow}
                style={{
                    padding: '6px 16px', borderRadius: '30px', fontSize: '0.85rem', fontWeight: '700',
                    cursor: 'pointer', border: 'none', transition: 'all 0.3s',
                    backgroundColor: isFollowing ? '#2563eb' : '#f1f5f9',
                    color: isFollowing ? '#fff' : '#475569',
                }}
            >
                {isFollowing ? '✓ 팔로잉' : '+ 팔로우'}
            </button>
            {/* 현재 서버 API가 팔로워 총 숫자를 제공하지 않으므로 이 부분은 기획에 따라 숨기거나 처리 필요 */}
        </div>
    );
};

export default FollowButton;