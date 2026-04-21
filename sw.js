// ═══════════════════════════════════════════════════════
// TrishTeam Service Worker v1.0
// Cache: trang chính + câu hỏi thi → dùng được offline
// ═══════════════════════════════════════════════════════

const CACHE_NAME = 'trishteam-v1';
const CACHE_STATIC = 'trishteam-static-v1';

// Files luôn cache (core app shell)
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/style.css',
  '/main.js',
  '/features-addon.css',
  '/features-addon.js',
  '/dashboard_widgets.js',
  '/driving-test.html',
  '/certificates.html',
  '/questions.js',
  '/questions_xd.js',
  '/notes.html',
  '/posts.html',
  '/traffic-signs.html',
  '/bridges.html',
  '/login.html',
  '/manifest.json'
];

// Cài đặt SW — cache static assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_STATIC).then(cache => {
      return cache.addAll(STATIC_ASSETS.map(url => {
        return new Request(url, { cache: 'reload' });
      })).catch(err => {
        console.warn('[SW] Một số file không cache được:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// Activate — xóa cache cũ
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_STATIC && k !== CACHE_NAME)
            .map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// Fetch strategy:
// - Static assets (HTML/CSS/JS/fonts): Cache First
// - Firebase / API calls: Network First
// - Google Drive JSON (bridges): Network First with Cache fallback
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Bỏ qua: extensions, analytics, non-GET
  if (event.request.method !== 'GET') return;
  if (url.protocol === 'chrome-extension:') return;
  if (url.hostname.includes('google-analytics')) return;
  if (url.hostname.includes('firebaseio.com')) return;
  if (url.hostname.includes('googleapis.com') && url.pathname.includes('/identitytoolkit')) return;

  // Firebase Realtime DB → Network Only
  if (url.hostname.includes('firebasedatabase.app') ||
      url.hostname.includes('firebaseio.com')) {
    return; // Let it go through normally
  }

  // Google Drive JSON (bridges data) → Network First, Cache fallback
  if (url.hostname.includes('drive.google.com') && url.searchParams.get('export') === 'download') {
    event.respondWith(
      fetch(event.request)
        .then(res => {
          const clone = res.clone();
          caches.open(CACHE_NAME).then(c => c.put(event.request, clone));
          return res;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Static files (same origin HTML/CSS/JS) → Cache First
  if (url.origin === self.location.origin ||
      url.hostname.includes('cdnjs.cloudflare.com') ||
      url.hostname.includes('fonts.googleapis.com') ||
      url.hostname.includes('fonts.gstatic.com')) {
    event.respondWith(
      caches.match(event.request).then(cached => {
        if (cached) return cached;
        return fetch(event.request).then(res => {
          if (res.ok) {
            const clone = res.clone();
            caches.open(CACHE_STATIC).then(c => c.put(event.request, clone));
          }
          return res;
        }).catch(() => {
          // Offline fallback cho HTML pages
          if (event.request.headers.get('accept')?.includes('text/html')) {
            return caches.match('/index.html');
          }
        });
      })
    );
    return;
  }

  // Mọi request khác → Network bình thường
});

// Message từ client (force update)
self.addEventListener('message', event => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
