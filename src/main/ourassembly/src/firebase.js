import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyBzt4ldYpIlVyLC_ESIqB03qHYKKxVwuZc",
  authDomain: "ourassembly-42dec.firebaseapp.com",
  projectId: "ourassembly-42dec",
  messagingSenderId: "848126961027",
  appId: "1:848126961027:web:6c2122e23a62ca503482b6",
};

const app = initializeApp(firebaseConfig);
export const messaging = getMessaging(app);
export const requestToken = async () => {
  try {
    const permission = await Notification.requestPermission();

    if (permission === "granted") {
      const token = await getToken(messaging, {
        vapidKey: "BIAahDosdiAGHyc3kRMtYNX7qE-QXp6mciq9Fk_TTJfiRbLBnPgG7d65aRP6R4iY7-aSTLgBua-gtD2B-r1oppA",
      });

      console.log("🔥 FCM 토큰 발급 성공:", token);
      return token;
    } else {
      console.log("❌ 알림 권한 거부됨");
      return null;
    }
  } catch (error) {
    console.error("⚠️ 토큰 요청 중 에러 발생:", error);
    return null;
  }
};