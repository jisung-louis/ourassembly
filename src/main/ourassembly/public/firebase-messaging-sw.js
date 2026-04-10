// firebase-messaging-sw.js
importScripts("https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyBzt4ldYpIlVyLC_ESIqB03qHYKKxVwuZc",
  authDomain: "ourassembly-42dec.firebaseapp.com",
  projectId: "ourassembly-42dec",
  messagingSenderId: "848126961027",
  appId: "1:848126961027:web:6c2122e23a62ca503482b6",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {

    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
        clients.forEach((client) => {
            client.postMessage({
                type: 'FCM_RECEIVE',
                payload: payload
            });
        });
    });
    // -------------------------------------------------------

    const title = payload.data?.title || payload.notification?.title || "새 알림";
    const body = payload.data?.body || payload.notification?.body || "내용이 도착했습니다.";

    const notificationOptions = {
        body: body,
        icon: "/logo192.png",
        badge: "/logo192.png"
    };

    return self.registration.showNotification(title, notificationOptions);
});