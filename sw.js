// MW Cosmetics Service Worker + FCM
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey:            "AIzaSyDCoTi2mUUsrbAfeEUgA-I45ZuUzRiZ9v8",
  authDomain:        "cosmeticsmw-bd93d.firebaseapp.com",
  projectId:         "cosmeticsmw-bd93d",
  storageBucket:     "cosmeticsmw-bd93d.firebasestorage.app",
  messagingSenderId: "654394172526",
  appId:             "1:654394172526:web:e40f0488b91ae31a1a727f"
});

var messaging = firebase.messaging();

// Background messages (app closed)
messaging.onBackgroundMessage(function(payload){
  var title = (payload.notification && payload.notification.title) ? payload.notification.title : 'MW Cosmetics';
  var body  = (payload.notification && payload.notification.body)  ? payload.notification.body  : '';
  self.registration.showNotification(title, {
    body:    body,
    icon:    '/CosmrticsMW/icon-192.png',
    badge:   '/CosmrticsMW/icon-192.png',
    vibrate: [200, 100, 200],
    data:    { url: 'https://hosammn.github.io/CosmrticsMW' }
  });
});

// Click notification -> open app
self.addEventListener('notificationclick', function(e){
  e.notification.close();
  var url = (e.notification.data && e.notification.data.url) ? e.notification.data.url : 'https://hosammn.github.io/CosmrticsMW';
  e.waitUntil(clients.openWindow(url));
});

// Cache
var CACHE_NAME = 'mw-cosmetics-v2';
self.addEventListener('install',  function(e){ self.skipWaiting(); });
self.addEventListener('activate', function(e){
  e.waitUntil(caches.keys().then(function(keys){
    return Promise.all(keys.filter(function(k){ return k!==CACHE_NAME; }).map(function(k){ return caches.delete(k); }));
  }));
  self.clients.claim();
});
self.addEventListener('fetch', function(e){
  if(e.request.url.indexOf('firestore')!==-1) return;
  if(e.request.url.indexOf('firebase') !==-1) return;
  e.respondWith(fetch(e.request).then(function(r){
    if(r.status===200){ var c=r.clone(); caches.open(CACHE_NAME).then(function(cache){ cache.put(e.request,c); }); }
    return r;
  }).catch(function(){ return caches.match(e.request); }));
});
