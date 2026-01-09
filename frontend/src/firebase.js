import { initializeApp } from "firebase/app";
import { getMessaging, getToken } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyBD7eqfwjfJ0Y9-IrVyuIkHCewRhNCPmw",
  authDomain: "banking-notifications.firebaseapp.com",
  projectId: "banking-notifications",
  storageBucket: "banking-notifications.appspot.com",
  messagingSenderId: "405783888456",
  appId: "1:405783888456:web:63c1280a4f10d91912ce7d"
};

const app = initializeApp(firebaseConfig);
export const messaging = getMessaging(app);

export const getFcmToken = async () => {
  const permission = await Notification.requestPermission();
  if (permission !== "granted") return null;

  return await getToken(messaging, {
    vapidKey: "BCtZsjXjovw--MosCPIsFUF5HDiToHMNrOFdlH70MI7Gbd4Vr8Re66BrnH-g369Iao9vkIk6J7z5u-L0te1wp48"
  });
};
