import { onMessage } from "firebase/messaging";
import { messaging } from "./firebase";

export const initNotifications = () => {
  onMessage(messaging, (payload) => {
    console.log("Foreground push:", payload);
    alert(
      payload.notification.title +
      " - " +
      payload.notification.body
    );
  });
};
