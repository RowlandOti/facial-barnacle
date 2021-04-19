importScripts("https://www.gstatic.com/firebasejs/8.4.1/firebase-app.js");
importScripts("https://www.gstatic.com/firebasejs/8.4.1/firebase-analytics.js");
importScripts("https://www.gstatic.com/firebasejs/8.4.1/firebase-messaging.js");

firebase.initializeApp({
    apiKey: "AIzaSyCjIj4u4Ueg4ZSAem7eQDZ9bEJmx9jG--g",
    authDomain: "facial-login.firebaseapp.com",
    projectId: "facial-login",
    storageBucket: "facial-login.appspot.com",
    messagingSenderId: "280044952377",
    appId: "1:280044952377:web:1559dbd647839e4b16a6e8",
    measurementId: "G-WF0R8VXDDR"
});

const messaging = firebase.messaging();

messaging.setBackgroundMessageHandler(function(payload) {
  const promiseChain = clients
    .matchAll({
      type: "window",
      includeUncontrolled: true
    })
    .then(windowClients => {
      for (let i = 0; i < windowClients.length; i++) {
        const windowClient = windowClients[i];
        windowClient.postMessage(payload);
      }
    })
    .then(() => {
      return registration.showNotification("my notification title");
    });
  return promiseChain;
});

self.addEventListener('notificationclick', function(event) {
  // do what you want
  // ...
});