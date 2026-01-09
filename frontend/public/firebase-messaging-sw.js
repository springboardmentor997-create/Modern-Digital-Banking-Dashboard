importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyBD7eqfwjfJ0Y9-IrVyuIkHCewRhNCPmw",
  authDomain: "banking-notifications.firebaseapp.com",
  projectId: "banking-notifications",
  storageBucket: "banking-notifications.appspot.com",
  messagingSenderId: "405783888456",
  appId: "1:405783888456:web:63c1280a4f10d91912ce7d",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log("[SW] Background message:", payload);

  self.registration.showNotification(
    payload.notification.title,
    {
      body: payload.notification.body,
      icon: "/logo.png",   // must be in public/
    }
  );
});
