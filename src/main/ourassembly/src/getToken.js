export const requestToken = async () => {
  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.log("알림 거부됨");
      return null;
    }

    // 이미 useFcm에서 등록했으니 여기선 그냥 가져오기만
    const registration = await navigator.serviceWorker.ready;

    const token = await getToken(messaging, {
      vapidKey: "BIAahDosdiAGHyc3kRMtYNX7qE-QXp6mciq9Fk_TTJfiRbLBnPgG7d65aRP6R4iY7-aSTLgBua-gtD2B-r1oppA",
      serviceWorkerRegistration: registration,
    });

    console.log("발급된 토큰:", token);
    return token;

  } catch (error) {
    console.error("FCM 토큰 발급 중 에러 발생:", error);
    return null;
  }
};