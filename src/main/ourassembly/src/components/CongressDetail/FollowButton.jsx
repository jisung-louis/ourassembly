import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getAuthorizationHeader } from '../../services/auth.js';

const FollowButton = ({ memberId }) => {
    const [isFollowing, setIsFollowing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

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
                console.error(err);
            } finally {
                setIsLoading(false); 
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
                await axios.delete(`http://localhost:8080/api/follow/${memberId}`, config);
                setIsFollowing(false);
            } else {
                await axios.post(`http://localhost:8080/api/follow/${memberId}`, {}, config);
                setIsFollowing(true);
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

    if (isLoading) return <div style={{ width: '82px', height: '33px' }} />;

    return (
        <button
            onClick={handleFollow}
            style={{
                padding: '6px 16px', borderRadius: '30px', 
                fontSize: '0.85rem', fontWeight: '700',
                cursor: 'pointer', border: 'none', transition: 'all 0.3s',
                backgroundColor: isFollowing ? '#2563eb' : '#f1f5f9',
                color: isFollowing ? '#fff' : '#475569',
            }}
        >
            {isFollowing ? '✓ 팔로잉' : '+ 팔로우'}
        </button>
    );
};

export default FollowButton;