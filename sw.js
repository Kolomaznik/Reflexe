/**
 * Service Worker pro Reflexe PWA
 * - Offline cache pro spolehlivé otvírání bez sítě
 * - Připomínky (pomocí periodic sync, fallback přes in-app setTimeout v index.html)
 * - Klik na notifikaci otevře formulář
 */
const CACHE_VERSION = 'reflexe-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png',
  './icon-maskable-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // Cache-first pro statické soubory
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  event.respondWith(
    caches.match(event.request).then((resp) => {
      if (resp) return resp;
      return fetch(event.request).then((netResp) => {
        // Cache nové soubory
        if (netResp.ok && event.request.method === 'GET') {
          const copy = netResp.clone();
          caches.open(CACHE_VERSION).then((c) => c.put(event.request, copy));
        }
        return netResp;
      }).catch(() => caches.match('./index.html'));
    })
  );
});

// Klik na notifikaci — otevři appku
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      for (const c of list) {
        if (c.url.includes('index.html') || c.url.endsWith('/')) {
          c.focus();
          return;
        }
      }
      return self.clients.openWindow('./index.html');
    })
  );
});

// Periodic Background Sync — Chrome experimental, fallback je in-app scheduling
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'reflexe-reminder') {
    event.waitUntil(showReminderIfTime());
  }
});

async function showReminderIfTime() {
  const now = new Date();
  const h = now.getHours();
  const m = now.getMinutes();
  // Pokud jsme v rámci 10 min od sudé hodiny 4–20, zobraz notifikaci
  if (h % 2 === 0 && h >= 4 && h <= 20 && m < 10) {
    await self.registration.showNotification('⏰ Čas na reflexi', {
      body: `Blok ${String(h).padStart(2,'0')}:00 — 3 minuty.`,
      icon: 'icon-192.png',
      badge: 'icon-192.png',
      tag: 'reflexe-' + h,
      requireInteraction: true
    });
  }
}

// Zpráva z app ("naplánuj mi připomínku na čas X")
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'schedule-reminder') {
    const targetMs = event.data.targetMs;
    const label = event.data.label || 'Čas na reflexi';
    const delay = targetMs - Date.now();
    if (delay > 0 && delay < 24 * 60 * 60 * 1000) {
      setTimeout(() => {
        self.registration.showNotification('⏰ ' + label, {
          body: '3 minuty na reflexi bloku.',
          icon: 'icon-192.png',
          badge: 'icon-192.png',
          requireInteraction: true
        });
      }, delay);
    }
  }
});
