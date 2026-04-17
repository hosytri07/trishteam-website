/* ==================== MENU & SCROLL ==================== */
const navMenu = document.getElementById('nav-menu'), navToggle = document.getElementById('nav-toggle'), navClose = document.getElementById('nav-close');
if(navToggle){ navToggle.addEventListener('click', () => navMenu.classList.add('show-menu')); }
if(navClose){ navClose.addEventListener('click', () => navMenu.classList.remove('show-menu')); }
document.querySelectorAll('.nav__link').forEach(n => n.addEventListener('click', () => navMenu.classList.remove('show-menu')));

const sections = document.querySelectorAll('section[id]');
window.addEventListener('scroll', () => {
    const scrollY = window.pageYOffset;
    sections.forEach(current =>{
        const sectionHeight = current.offsetHeight, sectionTop = current.offsetTop - 58, sectionId = current.getAttribute('id');
        if(scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) document.querySelector('.nav__menu a[href*=' + sectionId + ']').classList.add('active-link');
        else document.querySelector('.nav__menu a[href*=' + sectionId + ']').classList.remove('active-link');
    });
});

/* ==================== THEME ==================== */
const themeButton = document.getElementById('theme-button'), darkTheme = 'dark-theme', iconTheme = 'fa-sun';
const selectedTheme = localStorage.getItem('selected-theme'), selectedIcon = localStorage.getItem('selected-icon');
if (selectedTheme) {
  document.body.classList[selectedTheme === 'dark' ? 'add' : 'remove'](darkTheme);
  themeButton.classList[selectedIcon === 'fa-moon' ? 'add' : 'remove'](iconTheme);
}
themeButton.addEventListener('click', () => {
    document.body.classList.toggle(darkTheme); themeButton.classList.toggle(iconTheme);
    localStorage.setItem('selected-theme', document.body.classList.contains(darkTheme) ? 'dark' : 'light');
    localStorage.setItem('selected-icon', themeButton.classList.contains(iconTheme) ? 'fa-moon' : 'fa-sun');
});

/* ==================== TOAST & CHAT ==================== */
const toast = document.getElementById('toast-notification'); let toastTimer;
function triggerToast(msg) {
    if(msg) toast.querySelector('.toast__desc').innerText = msg;
    toast.classList.add('show'); clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 4000);
}
document.getElementById('toast-close').addEventListener('click', () => toast.classList.remove('show'));
window.addEventListener('load', () => setTimeout(() => triggerToast("Cảm ơn bạn đã ghé thăm Trish TEAM!"), 1000));

const chatBtn = document.getElementById('chat-btn'), chatOptions = document.getElementById('chat-options');
chatBtn.addEventListener('click', () => {
    chatOptions.classList.toggle('show');
    chatBtn.querySelector('.chat-icon').style.display = chatOptions.classList.contains('show') ? 'none' : 'block';
    chatBtn.querySelector('.close-icon').style.display = chatOptions.classList.contains('show') ? 'block' : 'none';
    chatBtn.style.animation = chatOptions.classList.contains('show') ? 'none' : 'pulse 2s infinite';
});

/* ==================== 1. WEB APP: QR & ZALO ==================== */
const qrContainer = document.getElementById('qrcode-container');
document.getElementById('webapp-paste-btn')?.addEventListener('click', async () => {
    try { document.getElementById('webapp-link-input').value = await navigator.clipboard.readText(); triggerToast('Đã dán link!'); } 
    catch(err) { triggerToast('Trình duyệt chặn quyền dán.'); }
});

document.getElementById('webapp-generate-btn')?.addEventListener('click', () => {
    let url = document.getElementById('webapp-link-input').value.trim();
    if(!url) { triggerToast('Vui lòng dán link!'); return; }
    let directUrl = url;
    const match = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (match) directUrl = `https://drive.google.com/uc?export=download&id=${match[1]}`;

    document.getElementById('webapp-direct-link').value = directUrl;
    qrContainer.innerHTML = ''; 
    new QRCode(qrContainer, { text: directUrl, width: 160, height: 160, colorDark: "#000", colorLight: "#fff", correctLevel: QRCode.CorrectLevel.H });
    document.getElementById('webapp-result').style.display = 'block';
    triggerToast('Đã tạo mã QR!');
});

document.getElementById('webapp-copy-btn')?.addEventListener('click', () => {
    document.getElementById('webapp-direct-link').select(); document.execCommand('copy'); triggerToast('Đã copy Direct Link!');
});

document.getElementById('webapp-download-qr-btn')?.addEventListener('click', () => {
    const qrCanvas = qrContainer.querySelector('canvas');
    if (qrCanvas) {
        const a = document.createElement('a'); a.href = qrCanvas.toDataURL("image/png"); a.download = 'TrishTeam_QRCode.png'; a.click(); triggerToast('Đã tải ảnh QR!');
    }
});

document.getElementById('webapp-zalo-btn')?.addEventListener('click', () => {
    navigator.clipboard.writeText(`📁 *TÀI LIỆU TRISH TEAM*\n\n🔗 *Link tải trực tiếp:*\n${document.getElementById('webapp-direct-link').value}\n\n📱 _Đính kèm ảnh QR để tải dễ dàng._`).then(() => {
        triggerToast('Đang mở Zalo...'); setTimeout(() => { window.location.href = "zalo://"; }, 800);
    });
});

/* ==================== 2. WEB APP: CODE EDITOR ==================== */
const codeEditor = document.getElementById('code-editor-area');
const lispTemplates = {
    tkl: "; Lệnh: TKL - Tính tổng khối lượng\n(defun c:TKL ( / ss i total val)\n  (prompt \"\\nQuet chon cac text:\")\n  (setq ss (ssget '((0 . \"TEXT\"))))\n  (setq total 0.0 i 0)\n  (while (< i (sslength ss))\n    (setq val (atof (cdr (assoc 1 (entget (ssname ss i))))))\n    (setq total (+ total val))\n    (setq i (1+ i))\n  )\n  (alert (strcat \"Tong khoi luong: \" (rtos total 2 2)))\n  (princ)\n)",
    cd: "; Lệnh: CD - Cắt chân Dim\n(defun c:CD ()\n  (prompt \"\\nChon duong line de cat chan Dim...\")\n  (princ \"\\nDa cat dim thanh cong!\")\n  (princ)\n)"
};
if(codeEditor) {
    codeEditor.addEventListener('keydown', function(e) {
        if (e.key === 'Tab') { e.preventDefault(); const start = this.selectionStart, end = this.selectionEnd; this.value = this.value.substring(0, start) + "    " + this.value.substring(end); this.selectionStart = this.selectionEnd = start + 4; }
    });
    document.getElementById('editor-template').addEventListener('change', (e) => { if(e.target.value) { codeEditor.value = lispTemplates[e.target.value]; triggerToast('Đã tải mẫu LISP!'); } });
    document.getElementById('editor-copy-btn').addEventListener('click', () => { if(codeEditor.value) { codeEditor.select(); document.execCommand('copy'); triggerToast('Đã copy Script!'); } });
    document.getElementById('editor-clear-btn').addEventListener('click', () => { codeEditor.value = ''; document.getElementById('editor-template').value = ''; });
    document.getElementById('editor-download-btn').addEventListener('click', () => {
        if(!codeEditor.value) return;
        const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([codeEditor.value], { type: 'text/plain' }));
        a.download = codeEditor.value.includes('defun') ? 'TrishTeam_Code.lsp' : 'TrishTeam_Note.txt'; a.click(); triggerToast('Đã lưu file!');
    });
}

/* ==================== 3. WEB APP: LỊCH VẠN NIÊN & SỰ KIỆN ==================== */
// Sử dụng thư viện lunar.js đã nhúng trên head
window.addEventListener('DOMContentLoaded', () => {
    if(typeof Lunar !== 'undefined') {
        const today = new Date();
        const lunar = Lunar.fromDate(today);
        
        // Hiển thị ngày
        document.getElementById('cal-solar').innerText = `${today.getDate().toString().padStart(2,'0')}/${(today.getMonth()+1).toString().padStart(2,'0')}/${today.getFullYear()}`;
        document.getElementById('cal-lunar').innerText = `Âm lịch: ${lunar.getDayInChinese()} tháng ${lunar.getMonthInChinese()}`;
        document.getElementById('cal-canchi').innerText = `Năm ${lunar.getYearInGanZhi()} - Ngày ${lunar.getDayInGanZhi()}`;

        // Mảng các ngày lễ quan trọng (Dương và Âm)
        const holidays = [
            { name: "Giải phóng Miền Nam", d: 30, m: 4, type: 'solar' },
            { name: "Quốc tế Lao động", d: 1, m: 5, type: 'solar' },
            { name: "Quốc khánh", d: 2, m: 9, type: 'solar' },
            { name: "Tết Nguyên Đán", d: 1, m: 1, type: 'lunar' },
            { name: "Giỗ Tổ Hùng Vương", d: 10, m: 3, type: 'lunar' }
        ];

        let nextHoliday = null;
        let minDays = 9999;

        holidays.forEach(h => {
            let targetDate;
            if(h.type === 'solar') {
                targetDate = new Date(today.getFullYear(), h.m - 1, h.d);
                if(targetDate < today) targetDate.setFullYear(today.getFullYear() + 1);
            } else {
                // Tìm ngày dương lịch của ngày lễ âm lịch trong năm nay
                let l = Lunar.fromYmd(lunar.getYear(), h.m, h.d);
                targetDate = new Date(l.getSolar().getYear(), l.getSolar().getMonth() - 1, l.getSolar().getDay());
                if(targetDate < today) {
                    l = Lunar.fromYmd(lunar.getYear() + 1, h.m, h.d);
                    targetDate = new Date(l.getSolar().getYear(), l.getSolar().getMonth() - 1, l.getSolar().getDay());
                }
            }
            const diffTime = Math.abs(targetDate - today);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            if(diffDays < minDays) { minDays = diffDays; nextHoliday = h.name; }
        });

        document.getElementById('holiday-name').innerText = nextHoliday;
        document.getElementById('holiday-days').innerText = minDays;
    }
});

/* ==================== 4. WEB APP: THẦN SỐ HỌC & TỬ VI SÂU ==================== */
document.getElementById('tv-calc-btn')?.addEventListener('click', () => {
    const d = parseInt(document.getElementById('tv-day').value);
    const m = parseInt(document.getElementById('tv-month').value);
    const y = parseInt(document.getElementById('tv-year').value);
    const gender = parseInt(document.getElementById('tv-gender').value); // 1 Nam, 0 Nữ
    
    if(!d || !m || !y || y < 1900 || y > 2100) { triggerToast('Vui lòng nhập Ngày Tháng Năm hợp lệ!'); return; }

    // 1. Thần số học (Con số chủ đạo)
    let sumString = `${d}${m}${y}`;
    let lifePath = 0;
    while(sumString.length > 1) {
        lifePath = sumString.split('').reduce((a, b) => parseInt(a) + parseInt(b), 0);
        if(lifePath === 11 || lifePath === 22 || lifePath === 33) break; // Số master
        sumString = lifePath.toString();
    }
    document.getElementById('tv-res-numerology').innerText = lifePath;

    // 2. Cung Hoàng Đạo
    const zodiacs = ["Ma Kết", "Bảo Bình", "Song Ngư", "Bạch Dương", "Kim Ngưu", "Song Tử", "Cự Giải", "Sư Tử", "Xử Nữ", "Thiên Bình", "Bọ Cạp", "Nhân Mã"];
    const zDates = [20, 19, 21, 20, 21, 22, 23, 23, 23, 24, 22, 22];
    let zIdx = m - 1; if(d < zDates[zIdx]) zIdx = (zIdx - 1 + 12) % 12;
    document.getElementById('tv-res-zodiac').innerText = zodiacs[zIdx];

    // 3. Tính Can Chi, Mệnh bằng thư viện Lunar (Chính xác tuyệt đối)
    if(typeof Lunar !== 'undefined') {
        const solarDate = new Date(y, m - 1, d);
        const l = Lunar.fromDate(solarDate);
        
        document.getElementById('tv-res-canchi').innerText = `Năm ${l.getYearInGanZhi()} - Tháng ${l.getMonthInGanZhi()} - Ngày ${l.getDayInGanZhi()}`;
        
        // Mệnh Lục Thập Hoa Giáp (Dựa trên Can Chi Năm)
        const canArr = ["Giáp","Ất","Bính","Đinh","Mậu","Kỷ","Canh","Tân","Nhâm","Quý"];
        const chiArr = ["Tý","Sửu","Dần","Mão","Thìn","Tỵ","Ngọ","Mùi","Thân","Dậu","Tuất","Hợi"];
        const canVal = [1,1,2,2,3,3,4,4,5,5][canArr.indexOf(l.getYearGan())];
        const chiVal = [0,0,1,1,2,2,0,0,1,1,2,2][chiArr.indexOf(l.getYearZhi())];
        let menhNum = canVal + chiVal; if(menhNum > 5) menhNum -= 5;
        const menhName = ["", "Kim (Vàng)", "Thủy (Nước)", "Hỏa (Lửa)", "Thổ (Đất)", "Mộc (Cây)"][menhNum];
        
        // Cung Phi theo giới tính và Màu sắc
        // Công thức tính Cung Phi: Lấy tổng các chữ số năm sinh (cộng tới 1 chữ số x). Nam = 11 - x, Nữ = 4 + x.
        let ySum = y.toString().split('').reduce((a, b) => parseInt(a) + parseInt(b), 0);
        while(ySum > 9) ySum = ySum.toString().split('').reduce((a, b) => parseInt(a) + parseInt(b), 0);
        
        let cungNum = gender === 1 ? (11 - ySum) : (4 + ySum);
        if(cungNum > 9) cungNum -= 9;
        
        const cungMapNam = {1:"Khảm (Thủy)", 2:"Khôn (Thổ)", 3:"Chấn (Mộc)", 4:"Tốn (Mộc)", 5:"Khôn (Thổ)", 6:"Càn (Kim)", 7:"Đoài (Kim)", 8:"Cấn (Thổ)", 9:"Ly (Hỏa)"};
        const cungMapNu = {1:"Cấn (Thổ)", 2:"Càn (Kim)", 3:"Đoài (Kim)", 4:"Cấn (Thổ)", 5:"Ly (Hỏa)", 6:"Khảm (Thủy)", 7:"Khôn (Thổ)", 8:"Chấn (Mộc)", 9:"Tốn (Mộc)"};
        const cungPhi = gender === 1 ? cungMapNam[cungNum] : cungMapNu[cungNum];
        
        // Nhóm cung (Đông Tứ Trạch / Tây Tứ Trạch)
        const isDongTuTrach = [1, 3, 4, 9].includes(cungNum);
        const huongTot = isDongTuTrach ? "Đông, Nam, Bắc, Đông Nam" : "Tây, Tây Bắc, Tây Nam, Đông Bắc";

        const colorMap = {
            1: "Trắng, Xám, Vàng (Hợp Kim)", // Kim
            2: "Đen, Xanh dương, Trắng (Hợp Thủy)", // Thủy
            3: "Xanh lá, Đỏ, Tím (Hợp Hỏa)", // Hỏa
            4: "Đỏ, Vàng, Nâu đất (Hợp Thổ)", // Thổ
            5: "Xanh biển, Đen, Xanh lá (Hợp Mộc)" // Mộc
        };

        document.getElementById('tv-res-menh').innerText = menhName;
        document.getElementById('tv-res-cung').innerText = cungPhi;
        document.getElementById('tv-res-huong').innerText = huongTot;
        document.getElementById('tv-res-color').innerText = colorMap[menhNum];
    }
    
    document.getElementById('tv-result').style.display = 'block';
});

/* ==================== 5. WEB APP: MÔ PHỎNG THỊ TRƯỜNG VÀNG & XĂNG ==================== */
// Lưu ý: Các API tài chính thật sự đều chặn CORS đối với trang tĩnh. 
// Dưới đây là thuật toán tạo giá trị mô phỏng thực tế (cập nhật thay đổi nhỏ theo ngày).
window.addEventListener('DOMContentLoaded', () => {
    const todayStr = new Date().toISOString().split('T')[0];
    let seed = 0; for(let i=0; i<todayStr.length; i++) seed += todayStr.charCodeAt(i);
    
    // Giá Vàng SJC (Khoảng 82 - 85 triệu)
    const baseGold = 82000000;
    const goldPrice = baseGold + (seed % 30) * 100000; 
    document.getElementById('market-gold').innerText = goldPrice.toLocaleString('vi-VN') + " ₫";
    
    // Giá Xăng RON 95 (Khoảng 23,000 - 25,000)
    const baseGas = 23000;
    const gasPrice = baseGas + (seed % 20) * 100;
    document.getElementById('market-gas').innerText = gasPrice.toLocaleString('vi-VN') + " ₫";
});

/* ==================== 6. WEB APP: TIN TỨC RSS VNEXPRESS ==================== */
const newsContainer = document.getElementById('news-container');
if(newsContainer) {
    fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent('https://vnexpress.net/rss/khoa-hoc.rss')}&api_key=`)
        .then(res => res.json())
        .then(data => {
            if (data.status === 'ok') {
                newsContainer.innerHTML = ''; 
                data.items.slice(0, 8).forEach(item => {
                    let imgSrc = 'https://via.placeholder.com/80x80?text=News';
                    const imgMatch = item.description.match(/src="([^"]+)"/);
                    if (imgMatch) imgSrc = imgMatch[1];
                    const pubDate = new Date(item.pubDate).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });

                    newsContainer.insertAdjacentHTML('beforeend', `
                        <div class="news-item">
                            <img src="${imgSrc}" alt="News" class="news-img">
                            <div class="news-content">
                                <h4><a href="${item.link}" target="_blank">${item.title}</a></h4>
                                <span class="news-date">${pubDate}</span>
                            </div>
                        </div>
                    `);
                });
            } else newsContainer.innerHTML = '<div style="padding: 2rem; text-align: center;">Không thể tải tin tức.</div>';
        }).catch(() => newsContainer.innerHTML = '<div style="padding: 2rem; text-align: center;">Lỗi kết nối.</div>');
}

/* ==================== FORM TELEGRAM ==================== */
const TELEGRAM_BOT_TOKEN = '8668861015:AAES7-vHAOuuV2D4Nk2budyQIzgZ9arIYRU'; 
const TELEGRAM_CHAT_ID = '1687867690'; 
const telegramForm = document.getElementById('telegram-form');
const submitBtn = document.getElementById('submit-btn');

if (telegramForm) {
    telegramForm.addEventListener('submit', async function(e) {
        e.preventDefault(); 
        const name = document.getElementById('sender-name').value;
        const email = document.getElementById('sender-email').value;
        const message = document.getElementById('sender-message').value;
        const imageFile = document.getElementById('sender-image').files[0]; 
        
        const text = `📬 <b>PHẢN HỒI MỚI</b>\n\n👤 <b>Tên:</b> ${name}\n📧 <b>Email:</b> ${email}\n💬 <b>Nội dung:</b>\n${message}`;
        const originalBtnHTML = submitBtn.innerHTML;
        submitBtn.innerHTML = '<span>Đang gửi...</span> <i class="fas fa-spinner fa-spin button__icon"></i>';
        submitBtn.disabled = true; submitBtn.style.opacity = '0.7';

        try {
            let response;
            if (imageFile) {
                const formData = new FormData();
                formData.append('chat_id', TELEGRAM_CHAT_ID); formData.append('photo', imageFile); formData.append('caption', text); formData.append('parse_mode', 'HTML');
                response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`, { method: 'POST', body: formData });
            } else {
                response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
                    method: 'POST', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text: text, parse_mode: 'HTML' })
                });
            }
            const data = await response.json();
            if (data.ok) { triggerToast('Đã gửi thành công!'); telegramForm.reset(); } 
            else triggerToast('Lỗi hệ thống!');
        } catch (error) { triggerToast('Lỗi mạng!'); } 
        finally { submitBtn.innerHTML = originalBtnHTML; submitBtn.disabled = false; submitBtn.style.opacity = '1'; }
    });
}
