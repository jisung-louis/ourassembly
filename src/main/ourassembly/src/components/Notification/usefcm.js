import { useEffect } from 'react';
import { onMessage, getToken } from "firebase/messaging";
import { messaging } from "../../firebase";
import axios from 'axios';

export function useFcm() {
  useEffect(() => {
    // 1. 서비스 워커 등록 및 강제 업데이트 관리
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/firebase-messaging-sw.js', {
        updateViaCache: 'none'
      })
      .then((reg) => {
        reg.update();

        reg.onupdatefound = () => {
          const installingWorker = reg.installing;
          if (installingWorker) {
            installingWorker.onstatechange = () => {
              if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('🔄 새 버전의 서비스 워커가 준비되었습니다. 앱을 재시작하세요.');
              }
            };
          }
        };

        // ✅ 서비스 워커 등록 완료 후 FCM 토큰 갱신
        return requestAndUpdateFcmToken(reg);
      })
      .catch((err) => console.error('❌ SW 등록 실패:', err));
    }

    // 2. 포그라운드 메시지 수신 처리
    const unsubscribe = onMessage(messaging, (payload) => {
      console.log("🔥 포그라운드 수신:", payload);

      if (Notification.permission === "granted") {
        const { title, body } = payload.notification || payload.data || {};
        new Notification(title || "우리동네 국회의원", {
          body: body || "새 알림이 도착했습니다.",
          icon: "/logo192.png",
          tag: "fcm-notification",
        });
      }
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);
}

// ✅ FCM 토큰 발급 후 서버에 저장
async function requestAndUpdateFcmToken(swRegistration) {
  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.warn('🔕 알림 권한 거부됨');
      return;
    }

    const token = await getToken(messaging, {
      vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
      serviceWorkerRegistration: swRegistration,
    });

    if (!token) {
      console.warn('FCM 토큰 발급 실패');
      return;
    }

    console.log('✅ FCM 토큰 발급:', token);

    // 로그인된 유저만 서버로 전송
    const jwtToken = localStorage.getItem('accessToken'); // 본인 프로젝트 키 확인
    if (!jwtToken) return;

    await axios.post('/api/user/fcm-token', { fcmToken: token }, {
      headers: { Authorization: `Bearer ${jwtToken}` }
    });

    console.log('✅ FCM 토큰 서버 저장 완료');
  } catch (err) {
    console.error('❌ FCM 토큰 갱신 실패:', err);
  }
}