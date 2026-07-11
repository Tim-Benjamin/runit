// public/sw.js
var CACHE_NAME = 'runit-v2';

// Handle window controls overlay for desktop PWA
self.addEventListener('message', function(event) {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(['/', '/favicon.svg']);
    }).then(function() { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k) { return k !== CACHE_NAME; })
            .map(function(k) { return caches.delete(k); })
      );
    }).then(function() { return clients.claim(); })
  );
});

self.addEventListener('fetch', function(event) {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(function() {
        return caches.match('/');
      })
    );
  }
});

// ── Push handler ──
self.addEventListener('push', function(event) {
  var data = {};
  try { data = event.data.json(); } catch(e) {}

  var isNewOrder  = data.data && data.data.sound === 'order';
  var requireInt  = isNewOrder; // keep screen on for new orders

  var title   = data.title || 'RunIt';
  var options = {
    body:               data.body || '',
    icon:               '/favicon.svg',
    badge:              '/favicon.svg',
    vibrate:            isNewOrder ? [300,100,300,100,300,100,600] : [200,100,200],
    requireInteraction: requireInt,
    tag:                isNewOrder ? 'runit-new-order' : ('runit-' + Date.now()),
    renotify:           true,
    data:               data.data || {},
    actions: isNewOrder ? [
      { action: 'accept',  title: '✓ View Order' },
      { action: 'dismiss', title: 'Dismiss' },
    ] : (data.data && data.data.order_id ? [
      { action: 'view',    title: '👁 View' },
      { action: 'dismiss', title: 'Dismiss' },
    ] : []),
  };

  // Play sound via client message (only works when app is open)
  // For background, we rely on the notification vibration + OS sound
  event.waitUntil(
    Promise.all([
      self.registration.showNotification(title, options),
      // Tell any open app clients to play sound
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(list) {
        list.forEach(function(client) {
          client.postMessage({
            type:    isNewOrder ? 'PLAY_ORDER_RINGTONE' : 'PLAY_NOTIFICATION_SOUND',
            payload: data,
          });
        });
      }),
    ])
  );
});

// ── Notification click ──
self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  if (event.action === 'dismiss') return;

  var url = '/';
  if (event.notification.data) {
    if (event.notification.data.url) url = event.notification.data.url;
    else if (event.notification.data.order_id) url = '/runner/feed';
  }

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(list) {
      for (var i = 0; i < list.length; i++) {
        var client = list[i];
        if ('focus' in client) {
          client.focus();
          if ('navigate' in client) client.navigate(url);
          return;
        }
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});