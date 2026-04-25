importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js");

const app = firebase.initializeApp({
  apiKey: self.__WB_MANIFEST ? "" : "",
  // Actual values are injected at build time or the app uses the same public config.
  // In production, the SW reads from the same env config baked by VitePWA or you can
  // hardcode the public Firebase config here (it is safe — these are public keys).
  // For now we rely on the page-level FCM token registration.
});

const messaging = firebase.messaging(app);

messaging.onBackgroundMessage((payload) => {
  const { title, body } = payload.notification || {};
  self.registration.showNotification(title || "Bantay Kalsada", {
    body: body || "You have a new update.",
    icon: "/icon-192.png",
    badge: "/icon-192.png",
  });
});
