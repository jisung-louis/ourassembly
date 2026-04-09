import React from 'react';
// import { messaging } from "../../firebase"; // FCM 설정 파일
// import { getToken } from "firebase/messaging";

export function NotificationBell({ unreadCount = 0 }) {

  // 종 클릭 시 실행될 함수
  const handleBellClick = async () => {
    try {
      // 1. 브라우저 권한 요청
      const permission = await Notification.requestPermission();
      
      if (permission === 'granted') {
        console.log('알림 권한 허용됨');
        
        const token = await getToken(messaging, { vapidKey: 'YOUR_VAPID_KEY' });
        if (token) {
          console.log("발급된 토큰:", token);
          alert("알림이 활성화되었습니다!");
        }
        
        alert("알림 권한이 허용되었습니다.");
      } else {
        alert("알림 권한이 거부되었습니다. 브라우저 설정에서 허용해 주세요.");
      }
    } catch (error) {
      console.error("알림 설정 중 오류:", error);
    }
  };

  return (
    <span 
      className="notification-bell" 
      onClick={handleBellClick} // 👈 클릭 이벤트 추가
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
  );
}