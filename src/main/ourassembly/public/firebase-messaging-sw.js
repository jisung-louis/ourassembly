// 버전: 20260413_v1 (업데이트가 안 되면 이 숫자를 아무거나로 바꾸세요)
importScripts("https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js");

// 1. 서비스 워커 생명주기 관리
self.addEventListener('install', (event) => {
  self.skipWaiting(); // 대기하지 않고 즉시 설치
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim()); // 즉시 페이지 제어권 획득
});

// 2. Firebase 초기화
firebase.initializeApp({
  apiKey: "AIzaSyBzt4ldYpIlVyLC_ESIqB03qHYKKxVwuZc",
  authDomain: "ourassembly-42dec.firebaseapp.com",
  projectId: "ourassembly-42dec",
  messagingSenderId: "848126961027",
  appId: "1:848126961027:web:6c2122e23a62ca503482b6",
});

const messaging = firebase.messaging();

// 3. 백그라운드 메시지 수신
messaging.onBackgroundMessage((payload) => {
    console.log('[sw.js] 백그라운드 수신:', payload);

    // React 앱(포그라운드)으로 메시지 전송
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
        clients.forEach((client) => {
            client.postMessage({
                type: 'FCM_RECEIVE',
                payload: payload
            });
        });
    });

    // 알림 표시 로직 (data와 notification 필드 모두 대응)
    const title = payload.notification?.title || payload.data?.title || "우리동네 국회의원";
    const body = payload.notification?.body || payload.data?.body || "새로운 소식이 도착했습니다.";

    return self.registration.showNotification(title, {
        body: body,
        icon: "/logo192.png",
        badge: "/logo192.png",
        tag: "our-assembly-notif", // 알림 중복 방지 태그
        data: {
          url: payload.data?.url || '/' // 클릭 시 이동할 URL 저장
        }
    });
});

// 4. 알림 클릭 이벤트
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // 이미 열려 있는 우리 사이트 탭이 있다면 포커스
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      // 없다면 새 창 열기
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});