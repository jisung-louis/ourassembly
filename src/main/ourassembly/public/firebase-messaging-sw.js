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


self.addEventListener('notificationclick', function(event) {
  event.notification.close(); // 알림창 닫기

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      // 1. 이미 열려 있는 우리 사이트 탭이 있는지 확인
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus(); // 있다면 그 탭으로 이동(포커스)
        }
      }
      // 2. 열려 있는 탭이 없다면 새로 열기
      if (clients.openWindow) {
        return clients.openWindow('/'); // 상대 경로 '/'만 써도 localhost:5173으로 연결됩니다.
      }
    })
  );
});