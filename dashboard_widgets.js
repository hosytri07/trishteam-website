
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
