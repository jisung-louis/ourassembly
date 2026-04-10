import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getAuthorizationHeader } from '../../services/auth.js';
import { requestToken } from "../../firebase.js";

const FollowButton = ({ memberId }) => {
    const [isFollowing, setIsFollowing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // 1. 초기 팔로우 상태 체크
    useEffect(() => {
        const checkInitialFollow = async () => {
            const authHeader = getAuthorizationHeader();
            if (!authHeader || !memberId) {
                setIsLoading(false);
                return;
            }

            try {
                const res = await axios.get('http://localhost:8080/api/follow', { 
                    headers: { Authorization: authHeader } 
                });
                const myFollows = res.data; 
                const following = myFollows.some(f => String(f.congressmanId) === String(memberId));
                setIsFollowing(following);
            } catch (err) {
                console.error("팔로우 상태 확인 실패:", err);
            } finally {
                setIsLoading(false); 
            }
        };
        checkInitialFollow();
    }, [memberId]);

    // 2. 팔로우 클릭 핸들러
    const handleFollow = async () => {
        const authHeader = getAuthorizationHeader();
        if (!authHeader) return alert('로그인이 필요합니다.');

        try {
            const config = { headers: { Authorization: authHeader } };
            
            if (isFollowing) {
                // [언팔로우 로직]
                await axios.delete(`http://localhost:8080/api/follow/${memberId}`, config);
                setIsFollowing(false);
            } else {
                // [팔로우 로직]
                await axios.post(`http://localhost:8080/api/follow/${memberId}`, {}, config);
                setIsFollowing(true);

                // 🔔 팔로우 성공 시 알림 권한 및 토큰 요청
                // 이미 허용했다면 팝업 없이 콘솔에 토큰만 찍힙니다.
                await requestToken();
            }
        } catch (err) {
            if (err.response?.status === 409) {
                alert("이미 팔로우 중인 의원입니다.");
                setIsFollowing(true);
            } else {
                alert('처리 중 오류가 발생했습니다.');
            }
        }
    };

    // 로딩 중일 때 버튼 자리 비워두기 (레이아웃 깨짐 방지)
    if (isLoading) {
        return <div style={{ width: '82px', height: '33px' }} />;
    }

    // 3. 버튼 UI (디자인 복구)
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
                onClick={handleFollow}
                style={{
                    padding: '6px 16px', 
                    borderRadius: '30px', 
                    fontSize: '0.85rem', 
                    fontWeight: '700',
                    cursor: 'pointer', 
                    border: 'none', 
                    transition: 'all 0.3s',
                    backgroundColor: isFollowing ? '#2563eb' : '#f1f5f9',
                    color: isFollowing ? '#fff' : '#475569',
                    boxShadow: isFollowing ? '0 2px 4px rgba(37, 99, 235, 0.2)' : 'none'
                }}
            >
                {isFollowing ? '✓ 팔로잉' : '+ 팔로우'}
            </button>
        </div>
    );
};

export default FollowButton;