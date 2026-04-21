
// ═══════════════════════════════════════════════════════
// DASHBOARD WIDGETS — Clock, Weather, Feed, Tools
// Phiên 26 — 20/04/2026
// ═══════════════════════════════════════════════════════

// ── Clock Widget ──
function startDashClock() {
    const tEl = document.getElementById('clock-time');
    const dEl = document.getElementById('clock-date');
    if (!tEl || !dEl) return;
    function tick() {
        const now = new Date();
        const hh = String(now.getHours()).padStart(2,'0');
        const mm = String(now.getMinutes()).padStart(2,'0');
        const ss = String(now.getSeconds()).padStart(2,'0');
        tEl.innerHTML = `${hh}<span class="clock-colon">:</span>${mm}<span class="clock-colon">:</span>${ss}`;
        const days = ['Chủ nhật','Thứ hai','Thứ ba','Thứ tư','Thứ năm','Thứ sáu','Thứ bảy'];
        const d = now.getDate();
        const mo = now.getMonth()+1;
        const yr = now.getFullYear();
        dEl.textContent = `${days[now.getDay()]}, ${d < 10?'0'+d:d}/${mo < 10?'0'+mo:mo}/${yr}`;
    }
    tick();
    setInterval(tick, 1000);
}

// ── Weather Widget (Open-Meteo — miễn phí, không cần API key) ──
async function loadDashWeather() {
    const iconEl = document.getElementById('weather-icon');
    const tempEl = document.getElementById('weather-temp');
    const descEl = document.getElementById('weather-desc');
    const humEl  = document.getElementById('weather-humidity');
    const winEl  = document.getElementById('weather-wind');
    if (!tempEl) return;
    // Tọa độ Đà Nẵng
    const url = 'https://api.open-meteo.com/v1/forecast?latitude=16.0544&longitude=108.2022&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&timezone=Asia%2FBangkok&forecast_days=1';
    try {
        const r = await fetch(url);
        const d = await r.json();
        const c = d.current;
        const wc = c.weather_code;
        // Map weather code → icon + description
        const WEATHER_MAP = {
            0:  { icon:'☀️',  desc:'Trời quang' },
            1:  { icon:'🌤',  desc:'Ít mây' },
            2:  { icon:'⛅',  desc:'Có mây' },
            3:  { icon:'☁️',  desc:'Nhiều mây' },
            45: { icon:'🌫',  desc:'Sương mù' },
            48: { icon:'🌫',  desc:'Sương mù có băng' },
            51: { icon:'🌦',  desc:'Mưa phùn nhẹ' },
            53: { icon:'🌦',  desc:'Mưa phùn vừa' },
            55: { icon:'🌧',  desc:'Mưa phùn dày' },
            61: { icon:'🌧',  desc:'Mưa nhẹ' },
            63: { icon:'🌧',  desc:'Mưa vừa' },
            65: { icon:'🌧',  desc:'Mưa to' },
            80: { icon:'🌦',  desc:'Mưa rào nhẹ' },
            81: { icon:'🌦',  desc:'Mưa rào vừa' },
            82: { icon:'⛈',  desc:'Mưa rào to' },
            95: { icon:'⛈',  desc:'Giông bão' },
            99: { icon:'⛈',  desc:'Giông kèm mưa đá' },
        };
        const w = WEATHER_MAP[wc] || { icon:'🌡', desc:'Không rõ' };
        if (iconEl) iconEl.textContent = w.icon;
        tempEl.textContent = Math.round(c.temperature_2m) + '°C';
        if (descEl) descEl.textContent = w.desc;
        if (humEl)  humEl.textContent  = '💧 ' + c.relative_humidity_2m + '%';
        if (winEl)  winEl.textContent  = '🌬 ' + Math.round(c.wind_speed_10m) + ' km/h';
    } catch(e) {
        if (descEl) descEl.textContent = 'Không thể tải thời tiết';
    }
}

// ── Posts Feed (lấy 4 bài mới nhất từ Firebase) ──
function loadDashFeed() {
    const grid = document.getElementById('home-feed-grid');
    if (!grid) return;
    if (typeof firebase === 'undefined' || !firebase.apps.length) return;
    // FEZ dots loading
    grid.innerHTML = '<div style="display:flex;align-items:center;gap:10px;padding:.5rem;color:var(--text-tertiary);font-size:.82rem"><div class="fez-dots"><span></span><span></span><span></span></div> Đang tải bài viết...</div>';
    const db = firebase.database();
    db.ref('posts').orderByChild('timestamp').limitToLast(4).once('value', snap => {
        const posts = [];
        snap.forEach(c => posts.unshift({ id: c.key, ...c.val() }));
        const pub = posts.filter(p => p.published);
        if (!pub.length) {
            grid.innerHTML = '<div class="feed-loading">Chưa có bài viết nào.</div>';
            return;
        }
        grid.innerHTML = pub.map(p => {
            const ts = p.timestamp ? new Date(p.timestamp).toLocaleDateString('vi-VN') : '';
            const excerpt = p.excerpt || (p.content || '').replace(/<[^>]*>/g,'').slice(0,80) + '…';
            return `<a href="posts.html#${p.id}" class="feed-card">
                <div class="feed-card-cat">${p.category || 'Bài viết'}</div>
                <div class="feed-card-title">${p.title || 'Không có tiêu đề'}</div>
                <div class="feed-card-excerpt">${excerpt}</div>
                <div class="feed-card-meta">${p.author || 'Admin'} · ${ts}</div>
            </a>`;
        }).join('');
    });
}

// ── Tool Compact click → mở tool modal (dùng lại logic cũ) ──
function initDashTools() {
    document.querySelectorAll('.tool-compact').forEach(el => {
        el.addEventListener('click', () => {
            const toolId = el.getAttribute('data-tool');
            if (typeof openTool === 'function') {
                openTool(toolId);
            } else {
                // fallback: scroll xuống nếu tool ở bên dưới
                const t = document.querySelector('[data-tool="' + toolId + '"]:not(.tool-compact)');
                if (t) t.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        });
    });
}

// ── Update Activity khi đã login ──
function updateDashActivity(user) {
    const guestEl = document.getElementById('activity-guest');
    const userEl  = document.getElementById('activity-user');
    const linkEl  = document.getElementById('activity-link');
    if (!user) {
        if (guestEl) guestEl.style.display = '';
        if (userEl)  userEl.style.display  = 'none';
        if (linkEl)  linkEl.style.display  = 'none';
        return;
    }
    if (guestEl) guestEl.style.display = 'none';
    if (userEl)  userEl.style.display  = '';
    if (linkEl)  linkEl.style.display  = '';
    // Quick access: bỏ lock icon cho Notes
    document.querySelectorAll('.quick-item-needs-login').forEach(el => el.classList.add('unlocked'));
    // Lấy notes gần nhất
    if (typeof firebase === 'undefined' || !firebase.apps.length) return;
    const db = firebase.database();
    db.ref('notes/' + user.uid).orderByChild('updatedAt').limitToLast(5).once('value', snap => {
        const notes = [];
        snap.forEach(c => notes.unshift({ id: c.key, ...c.val() }));
        const list = document.getElementById('activity-list');
        if (!list || !notes.length) return;
        list.innerHTML = notes.map(n => {
            const ts = n.updatedAt ? timeAgo(n.updatedAt) : '';
            return `<div class="activity-item">
                <div class="activity-dot"></div>
                <div>
                    <div class="activity-text">📝 ${n.title || 'Ghi chú không tên'}</div>
                    <div class="activity-time">${ts}</div>
                </div>
            </div>`;
        }).join('');
    });
}

function timeAgo(ts) {
    const s = Math.floor((Date.now() - ts) / 1000);
    if (s < 60)    return 'vừa xong';
    if (s < 3600)  return Math.floor(s/60) + ' phút trước';
    if (s < 86400) return Math.floor(s/3600) + ' giờ trước';
    return Math.floor(s/86400) + ' ngày trước';
}

// ── Init tất cả widgets khi trang load ──
document.addEventListener('DOMContentLoaded', () => {
    startDashClock();
    loadDashWeather();
    initDashTools();
    // Delay feed một chút chờ Firebase init
    setTimeout(loadDashFeed, 1200);
});

// ═══════════════════════════════════════════════════════
// GLOBAL SEARCH — Tìm trong: posts, biển báo, cầu VN, câu hỏi thi
// ═══════════════════════════════════════════════════════

let _searchTimer = null;
let _searchOpen  = false;
let _postsCache  = null;
let _signsCache  = null;

function globalSearchDebounce() {
    clearTimeout(_searchTimer);
    const q = document.getElementById('global-search-input')?.value?.trim();
    const clearBtn = document.getElementById('search-clear');
    if (clearBtn) clearBtn.style.display = q ? '' : 'none';
    if (!q) { closeSearch(); return; }
    _searchTimer = setTimeout(() => runGlobalSearch(q), 280);
}

function openSearch() {
    const q = document.getElementById('global-search-input')?.value?.trim();
    if (q) runGlobalSearch(q);
    document.addEventListener('click', searchOutsideHandler, { once: false });
    _searchOpen = true;
}

function closeSearch() {
    const dd = document.getElementById('search-dropdown');
    if (dd) dd.style.display = 'none';
    _searchOpen = false;
    document.removeEventListener('click', searchOutsideHandler);
}

function clearSearch() {
    const inp = document.getElementById('global-search-input');
    if (inp) { inp.value = ''; inp.focus(); }
    const clearBtn = document.getElementById('search-clear');
    if (clearBtn) clearBtn.style.display = 'none';
    closeSearch();
}

function searchOutsideHandler(e) {
    const wrap = document.getElementById('nav-search-wrap');
    if (wrap && !wrap.contains(e.target)) closeSearch();
    else document.addEventListener('click', searchOutsideHandler, { once: false });
}

async function runGlobalSearch(q) {
    const dd = document.getElementById('search-dropdown');
    const res = document.getElementById('search-results');
    if (!dd || !res) return;
    dd.style.display = '';
    res.innerHTML = '<div class="search-empty">Đang tìm...</div>';

    const kw = q.toLowerCase();
    const results = [];

    // 1. Tìm trong Posts (Firebase)
    try {
        if (!_postsCache && typeof firebase !== 'undefined' && firebase.apps.length) {
            const snap = await firebase.database().ref('posts').orderByChild('published').equalTo(true).limitToLast(200).once('value');
            _postsCache = [];
            snap.forEach(c => _postsCache.push({ id: c.key, ...c.val() }));
        }
        if (_postsCache) {
            _postsCache.filter(p =>
                (p.title || '').toLowerCase().includes(kw) ||
                (p.excerpt || '').toLowerCase().includes(kw)
            ).slice(0, 3).forEach(p => results.push({
                type: 'post', icon: '📰', label: 'Bài viết',
                title: p.title || 'Không tên',
                sub: p.category || 'Bài viết',
                href: `posts.html#${p.id}`
            }));
        }
    } catch(e) {}

    // 2. Tìm trong Biển báo (Firebase)
    try {
        if (!_signsCache && typeof firebase !== 'undefined' && firebase.apps.length) {
            const snap = await firebase.database().ref('traffic_signs').limitToFirst(300).once('value');
            _signsCache = [];
            snap.forEach(c => _signsCache.push({ id: c.key, ...c.val() }));
        }
        if (_signsCache) {
            _signsCache.filter(s =>
                (s.name || '').toLowerCase().includes(kw) ||
                (s.desc || '').toLowerCase().includes(kw) ||
                (s.id || '').toLowerCase().includes(kw)
            ).slice(0, 3).forEach(s => results.push({
                type: 'sign', icon: '🚦', label: 'Biển báo',
                title: s.name || s.id || 'Biển báo',
                sub: s.id || '',
                href: `traffic-signs.html`
            }));
        }
    } catch(e) {}

    // 3. Tìm trong câu hỏi thi (nếu questions.js đã load)
    try {
        const allQ = window.ALL_QUESTIONS || [];
        allQ.filter(q2 =>
            (q2.text || q2.question || '').toLowerCase().includes(kw)
        ).slice(0, 2).forEach(q2 => results.push({
            type: 'quiz', icon: '🚗', label: 'Câu hỏi',
            title: (q2.text || q2.question || '').slice(0, 60) + '…',
            sub: 'Ôn thi lái xe',
            href: 'driving-test.html'
        }));
    } catch(e) {}

    // 4. Tìm nhanh trong các trang
    const PAGES = [
        { title: 'Ôn thi lái xe', sub: '838 câu A1/B1/B2/C', href: 'driving-test.html', icon: '🚗' },
        { title: 'Chứng chỉ hành nghề XD', sub: '345 câu', href: 'certificates.html', icon: '🏗️' },
        { title: 'Biển báo giao thông', sub: 'QC41:2024 — 143 biển', href: 'traffic-signs.html', icon: '🚦' },
        { title: 'Cầu Việt Nam (VBMS)', sub: '7.897 cầu quốc lộ', href: 'bridges.html', icon: '🌉' },
        { title: 'TrishNotes — Ghi chú', sub: 'Ghi chú cá nhân Firebase', href: 'notes.html', icon: '📝' },
        { title: 'Bảng tin', sub: 'Tin tức & chia sẻ', href: 'posts.html', icon: '📰' },
    ];
    PAGES.filter(p => p.title.toLowerCase().includes(kw) || p.sub.toLowerCase().includes(kw))
        .slice(0, 2).forEach(p => results.push({ type: 'page', icon: p.icon, label: 'Trang', ...p }));

    // Render kết quả
    if (!results.length) {
        res.innerHTML = `<div class="search-empty">Không tìm thấy kết quả nào cho "<strong>${esc(q)}</strong>"</div>`;
        return;
    }

    const grouped = {};
    results.forEach(r => {
        if (!grouped[r.label]) grouped[r.label] = [];
        grouped[r.label].push(r);
    });

    let html = '';
    for (const [label, items] of Object.entries(grouped)) {
        html += `<div class="search-section-label">${label}</div>`;
        items.forEach(item => {
            const titleHL = highlight(item.title, q);
            html += `<a href="${item.href}" class="search-item" onclick="closeSearch()">
                <div class="search-item-icon">${item.icon}</div>
                <div class="search-item-text">
                    <div class="search-item-title">${titleHL}</div>
                    <div class="search-item-sub">${esc(item.sub || '')}</div>
                </div>
                <span class="search-item-type">${esc(item.label)}</span>
            </a>`;
        });
    }
    html += `<div class="search-hint">Nhấn Enter để tìm kiếm nâng cao</div>`;
    res.innerHTML = html;
}

function highlight(text, kw) {
    if (!kw) return esc(text);
    const re = new RegExp('(' + kw.replace(/[.*+?^${}()|[\]\\]/g,'\\$&') + ')', 'gi');
    return esc(text).replace(re, '<mark class="sh">$1</mark>');
}
function esc(s) {
    return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

// Enter → đến bridges nếu dài, driving-test nếu ngắn
document.addEventListener('DOMContentLoaded', () => {
    const inp = document.getElementById('global-search-input');
    if (inp) {
        inp.addEventListener('keydown', e => {
            if (e.key === 'Escape') { clearSearch(); inp.blur(); }
            if (e.key === 'Enter') {
                const q = inp.value.trim();
                if (q.length > 2) {
                    closeSearch();
                    window.location.href = 'bridges.html?q=' + encodeURIComponent(q);
                }
            }
        });
    }
});

// ═══════════════════════════════════════════════════════
// PWA — Service Worker Registration
// ═══════════════════════════════════════════════════════
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js', { scope: '/' })
            .then(reg => {
                console.log('[PWA] Service Worker đã đăng ký:', reg.scope);
                // Thông báo cập nhật nếu có SW mới
                reg.addEventListener('updatefound', () => {
                    const newWorker = reg.installing;
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            // Có bản cập nhật mới — hiện toast
                            if (typeof showToast === 'function') {
                                showToast('🔄 Có bản cập nhật mới! Tải lại trang để áp dụng.');
                            }
                        }
                    });
                });
            })
            .catch(err => console.warn('[PWA] SW đăng ký thất bại:', err));
    });
}

// ── PWA Install Prompt ──
let _deferredPrompt = null;
window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault();
    _deferredPrompt = e;
    // Hiện banner sau 3 giây
    setTimeout(() => {
        const banner = document.getElementById('pwa-banner');
        if (banner) banner.style.display = 'flex';
    }, 3000);
});

const pwaInstallBtn = document.getElementById('pwa-install-btn');
if (pwaInstallBtn) {
    pwaInstallBtn.addEventListener('click', async () => {
        if (!_deferredPrompt) return;
        _deferredPrompt.prompt();
        const { outcome } = await _deferredPrompt.userChoice;
        _deferredPrompt = null;
        const banner = document.getElementById('pwa-banner');
        if (banner) banner.style.display = 'none';
        if (outcome === 'accepted' && typeof showToast === 'function') {
            showToast('✓ TrishTeam đã được thêm vào màn hình!');
        }
    });
}

window.addEventListener('appinstalled', () => {
    _deferredPrompt = null;
    const banner = document.getElementById('pwa-banner');
    if (banner) banner.style.display = 'none';
});
