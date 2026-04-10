import { useEffect } from 'react';
import { onMessage } from "firebase/messaging";
import { messaging, requestToken } from "../../firebase"; // requestToken 불러오기
import { getStoredAuthUser } from '../../services/auth';

export function useFcm() {
  useEffect(() => {
    const user = getStoredAuthUser();
    if (!user) return;

    // 1. 페이지 로드 시 토큰 요청 및 서버 저장
    const setupFCM = async () => {
      const token = await requestToken();
      if (token) {
        // [중요!] 여기서 백엔드 API를 호출해 token을 DB에 저장해야 합니다.
        // 예: await api.saveFCMToken({ userId: user.id, token: token });
        console.log("서버에 저장할 토큰:", token);
      }
    };
    setupFCM();

    // 2. 포그라운드(창이 켜져있을 때) 알림 처리
    const unsubscribe = onMessage(messaging, (payload) => {
      console.log("🔥 포그라운드 메시지 수신:", payload);
      // ... 알림 띄우는 기존 로직 ...
    });

    return () => unsubscribe();
  }, []);
}