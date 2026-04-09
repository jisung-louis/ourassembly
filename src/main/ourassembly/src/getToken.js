import { getToken } from "firebase/messaging";
import { messaging } from "./firebase";

export const requestToken = async () => {
  const permission = await Notification.requestPermission();

  if (permission === "granted") {
    const token = await getToken(messaging, {
      vapidKey: "BIAahDosdiAGHyc3kRMtYNX7qE-QXp6mciq9Fk_TTJfiRbLBnPgG7d65aRP6R4iY7-aSTLgBua-gtD2B-r1oppA",
    });

    console.log("토큰:", token);
  } else {
    console.log("알림 거부됨");
  }
};