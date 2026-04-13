import { useEffect } from 'react';
import { onMessage } from "firebase/messaging";
import { messaging } from "../../firebase";

export function useFcm() {
  useEffect(() => {
    const unsubscribe = onMessage(messaging, (payload) => {
      console.log("🔥 포그라운드 수신:", payload);

      const { title, body } = payload.data || {};

      if (Notification.permission === "granted") {
        new Notification(title || "우리동네 국회의원", {
          body: body || "새 알림이 도착했습니다.",
          icon: "/logo192.png",
        });
      }
    });

    return () => unsubscribe();
  }, []);
}