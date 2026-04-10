import { useEffect } from 'react';
import { onMessage } from "firebase/messaging";
import { messaging } from "../../firebase";
import { getStoredAuthUser } from '../../services/auth'

export function useFcm() {
  useEffect(() => {
    const user = getStoredAuthUser();
    if (!user) return;

    const unsubscribe = onMessage(messaging, (payload) => {
      console.log("🔥 메시지 도착:", payload);

      const title = payload.notification?.title || "우리동네 국회의원";
      const body = payload.notification?.body || "새로운 소식이 있습니다.";

      if (Notification.permission === "granted") {
        new Notification(title, {
          body: body,
          icon: "/logo192.png",
          requireInteraction: true,
        });
      }

      if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'FCM_RECEIVE',
          payload: payload
        })
      }
    });

    return () => unsubscribe();
  }, []);
}