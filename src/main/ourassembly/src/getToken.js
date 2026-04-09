import { initializeApp } from "firebase/app";
import { getMessaging, getToken } from "firebase/messaging"; // import는 한곳에 모아야 합니다.

const firebaseConfig = {
  apiKey: "AIzaSyBzt4ldYpIlVyLC_ESIqB03qHYKKxVwuZc",
  authDomain: "ourassembly-42dec.firebaseapp.com",
  projectId: "ourassembly-42dec",
  messagingSenderId: "848126961027",
  appId: "1:848126961027:web:6c2122e23a62ca503482b6",
};

// 1. 앱 초기화
const app = initializeApp(firebaseConfig);

// 2. messaging 객체 생성 및 내보내기
export const messaging = getMessaging(app);

// 3. 토큰 요청 함수 (export를 붙여야 다른 파일에서 쓸 수 있음)
export const requestToken = async () => {
  try {
    const permission = await Notification.requestPermission();

    if (permission === "granted") {
      const token = await getToken(messaging, {
        vapidKey: "BIAahDosdiAGHyc3kRMtYNX7qE-QXp6mciq9Fk_TTJfiRbLBnPgG7d65aRP6R4iY7-aSTLgBua-gtD2B-r1oppA",
      });

      console.log("발급된 토큰:", token);
      return token; // 토큰을 반환해줘야 나중에 DB에 저장하기 편해요
    } else {
      console.log("알림 거부됨");
      return null;
    }
  } catch (error) {
    console.error("FCM 토큰 발급 중 에러 발생:", error);
    return null;
  }
};