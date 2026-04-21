// ═══════════════════════════════════════════════════════
// TrishTeam Service Worker v2.0
// Strategy: Network First cho HTML/CSS/JS, Cache First chỉ cho offline fallback
// ═══════════════════════════════════════════════════════

const CACHE_NAME   = 'trishteam-v6';   // ← Tăng version → clear cache cũ ngay
const CACHE_STATIC = 'trishteam-static-v6';

// Chỉ cache câu hỏi thi và questions (ít thay đổi, dùng offline)
const PRECACHE_ASSETS = [
  '/questions.js',
  '/questions_xd.js',
  '/manifest.json',
];

// Cài đặt SW
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_STATIC)
      .then(cache => cache.addAll(PRECACHE_ASSETS.map(u => new Request(u, { cache: 'reload' })))
        .catch(err => console.warn('[SW] Pre-cache partial fail:', err))
      )
      .then(() => self.skipWaiting())
  );
});

// Activate — xóa TẤT CẢ cache cũ (trishteam-v1 đến v5)
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_STATIC && k !== CACHE_NAME)
            .map(k => { console.log('[SW] Deleting old cache:', k); return caches.delete(k); })
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Bỏ qua: non-GET, extensions, analytics
  if (event.request.method !== 'GET') return;
  if (url.protocol === 'chrome-extension:') return;
  if (url.hostname.includes('google-analytics')) return;
  if (url.hostname.includes('firebasedatabase.app')) return;
  if (url.hostname.includes('firebaseio.com')) return;
  if (url.hostname.includes('googleapis.com')) return;
  if (url.hostname.includes('gstatic.com')) return;
  if (url.hostname.includes('gstaticapp')) return;

  // Same origin requests
  if (url.origin === self.location.origin) {
    const path = url.pathname;

    // Questions JS → Cache First (ít thay đổi)
    if (path === '/questions.js' || path === '/questions_xd.js') {
      event.respondWith(
        caches.match(event.request).then(cached => {
          const fetchPromise = fetch(event.request).then(res => {
            if (res.ok) caches.open(CACHE_STATIC).then(c => c.put(event.request, res.clone()));
            return res;
          });
          return cached || fetchPromise;
        })
      );
      return;
    }

    // bd*.json (bridge data) → Cache First with background refresh
    if (path.match(/^\/bd\d+\.json$/)) {
      event.respondWith(
        caches.match(event.request).then(cached => {
          const networkFetch = fetch(event.request).then(res => {
            if (res.ok) caches.open(CACHE_NAME).then(c => c.put(event.request, res.clone()));
            return res;
          }).catch(() => cached);
          return cached || networkFetch;
        })
      );
      return;
    }

    // HTML, CSS, JS → NETWORK FIRST (luôn fetch mới, fallback cache)
    event.respondWith(
      fetch(event.request)
        .then(res => {
          if (res.ok) {
            caches.open(CACHE_STATIC).then(c => c.put(event.request, res.clone()));
          }
          return res;
        })
        .catch(() => {
          return caches.match(event.request).then(cached => {
            if (cached) return cached;
            // Offline HTML fallback
            if (event.request.headers.get('accept')?.includes('text/html')) {
              return caches.match('/index.html');
            }
          });
        })
    );
    return;
  }

  // External: CDN fonts → Cache First
  if (url.hostname.includes('cdnjs.cloudflare.com') ||
      url.hostname.includes('fonts.googleapis.com') ||
      url.hostname.includes('fonts.gstatic.com') ||
      url.hostname.includes('cdn.jsdelivr.net')) {
    event.respondWith(
      caches.match(event.request).then(cached => {
        if (cached) return cached;
        return fetch(event.request).then(res => {
          if (res.ok) caches.open(CACHE_NAME).then(c => c.put(event.request, res.clone()));
          return res;
        });
      })
    );
    return;
  }
});

// Message → force update
self.addEventListener('message', event => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
});
