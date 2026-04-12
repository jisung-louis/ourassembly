import { useEffect } from 'react';
import { onMessage } from "firebase/messaging";
import { messaging } from "../../firebase";

export function useFcm() {
  useEffect(() => {
    const unsubscribe = onMessage(messaging, (payload) => {
      console.log("🔥 포그라운드 메시지 수신:", payload);

      const title = payload.data?.title || payload.notification?.title || "새 알림";
      const body = payload.data?.body || payload.notification?.body || "";

      if (Notification.permission === "granted") {
        new Notification(title, { body });
      }
    });

    return () => unsubscribe();
  }, []);
}