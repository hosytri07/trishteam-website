// ═══════════════════════════════════════════════════════
// TrishTeam Service Worker v3.0 — MINIMAL CACHE
// HTML/CSS/JS: KHÔNG cache (luôn fetch mới)
// Fonts + bd*.json: cache OK
// Sau khi activate, browser sẽ luôn load mới mọi request HTML/CSS/JS
// ═══════════════════════════════════════════════════════

const CACHE_NAME = 'trishteam-v7-cdn';

self.addEventListener('install', event => {
  // Skip waiting → activate ngay lập tức
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    Promise.all([
      // Xóa TẤT CẢ cache cũ (v1-v6)
      caches.keys().then(keys =>
        Promise.all(
          keys.filter(k => k !== CACHE_NAME).map(k => {
            console.log('[SW v7] Delete cache:', k);
            return caches.delete(k);
          })
        )
      ),
      // Claim ngay lập tức
      self.clients.claim()
    ])
  );
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  
  // Bỏ qua: non-GET, extensions, Firebase, Google APIs
  if (event.request.method !== 'GET') return;
  if (url.protocol === 'chrome-extension:') return;
  if (url.hostname.includes('firebase')) return;
  if (url.hostname.includes('google-analytics')) return;
  if (url.hostname.includes('googleapis.com')) return;
  
  // bd*.json → cache OK
  if (url.pathname.match(/^\/bd\d+\.json$/)) {
    event.respondWith(
      caches.match(event.request).then(cached =>
        cached || fetch(event.request).then(res => {
          if (res.ok) caches.open(CACHE_NAME).then(c => c.put(event.request, res.clone()));
          return res;
        })
      )
    );
    return;
  }
  
  // CDN fonts → cache OK
  if (url.hostname.includes('cdnjs.cloudflare.com') ||
      url.hostname.includes('fonts.googleapis.com') ||
      url.hostname.includes('fonts.gstatic.com')) {
    event.respondWith(
      caches.match(event.request).then(cached =>
        cached || fetch(event.request).then(res => {
          if (res.ok) caches.open(CACHE_NAME).then(c => c.put(event.request, res.clone()));
          return res;
        })
      )
    );
    return;
  }
  
  // TẤT CẢ request khác (HTML, CSS, JS) → KHÔNG đụng vào, để browser xử lý bình thường
  // Vercel headers no-cache sẽ ngăn browser cache
});

// Force update từ client
self.addEventListener('message', event => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
});
