/* ==================== MENU & THEME ==================== */
const navMenu = document.getElementById('nav-menu'),
      navToggle = document.getElementById('nav-toggle'),
      navClose = document.getElementById('nav-close');

if(navToggle){ navToggle.addEventListener('click', () => navMenu.classList.add('show-menu')); }
if(navClose){ navClose.addEventListener('click', () => navMenu.classList.remove('show-menu')); }

document.querySelectorAll('.nav__link').forEach(n => n.addEventListener('click', () => navMenu.classList.remove('show-menu')));

const sections = document.querySelectorAll('section[id]');
window.addEventListener('scroll', () => {
    const scrollY = window.pageYOffset;
    sections.forEach(current =>{
        const sectionHeight = current.offsetHeight, sectionTop = current.offsetTop - 58, sectionId = current.getAttribute('id');
        if(scrollY > sectionTop && scrollY <= sectionTop + sectionHeight){
            document.querySelector('.nav__menu a[href*=' + sectionId + ']').classList.add('active-link');
        }else{
            document.querySelector('.nav__menu a[href*=' + sectionId + ']').classList.remove('active-link');
        }
    });
});

const themeButton = document.getElementById('theme-button');
const darkTheme = 'dark-theme';
const iconTheme = 'fa-sun';
const selectedTheme = localStorage.getItem('selected-theme');
const selectedIcon = localStorage.getItem('selected-icon');

if (selectedTheme) {
  document.body.classList[selectedTheme === 'dark' ? 'add' : 'remove'](darkTheme);
  themeButton.classList[selectedIcon === 'fa-moon' ? 'add' : 'remove'](iconTheme);
}

themeButton.addEventListener('click', () => {
    document.body.classList.toggle(darkTheme);
    themeButton.classList.toggle(iconTheme);
    localStorage.setItem('selected-theme', document.body.classList.contains(darkTheme) ? 'dark' : 'light');
    localStorage.setItem('selected-icon', themeButton.classList.contains(iconTheme) ? 'fa-moon' : 'fa-sun');
});

/* ==================== TOAST & CHAT WIDGET ==================== */
const toast = document.getElementById('toast-notification');
let toastTimer;
function triggerToast(message) {
    if(message) toast.querySelector('.toast__desc').innerText = message;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { toast.classList.remove('show'); }, 4000);
}
document.getElementById('toast-close').addEventListener('click', () => toast.classList.remove('show'));

const chatBtn = document.getElementById('chat-btn');
const chatOptions = document.getElementById('chat-options');
chatBtn.addEventListener('click', () => {
    chatOptions.classList.toggle('show');
    chatBtn.querySelector('.chat-icon').style.display = chatOptions.classList.contains('show') ? 'none' : 'block';
    chatBtn.querySelector('.close-icon').style.display = chatOptions.classList.contains('show') ? 'block' : 'none';
    chatBtn.style.animation = chatOptions.classList.contains('show') ? 'none' : 'pulse 2s infinite';
});

/* ==================== WEB APP: QR & ZALO ==================== */
const pasteBtn = document.getElementById('webapp-paste-btn');
const generateBtn = document.getElementById('webapp-generate-btn');
const linkInput = document.getElementById('webapp-link-input');
const qrContainer = document.getElementById('qrcode-container');

if(pasteBtn) {
    pasteBtn.addEventListener('click', async () => {
        try {
            linkInput.value = await navigator.clipboard.readText();
            triggerToast('Đã dán link từ bộ nhớ tạm!');
        } catch (err) { triggerToast('Trình duyệt chặn quyền đọc bộ nhớ tạm.'); }
    });
}

if(generateBtn) {
    generateBtn.addEventListener('click', () => {
        let url = linkInput.value.trim();
        if(!url) { triggerToast('Vui lòng dán link!'); return; }

        let directUrl = url;
        const match = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
        if (match) directUrl = `https://drive.google.com/uc?export=download&id=${match[1]}`;

        document.getElementById('webapp-direct-link').value = directUrl;
        qrContainer.innerHTML = ''; 
        new QRCode(qrContainer, { text: directUrl, width: 160, height: 160, colorDark : "#000000", colorLight : "#ffffff", correctLevel : QRCode.CorrectLevel.H });

        document.getElementById('webapp-result').style.display = 'block';
        triggerToast('Đã tạo mã QR!');
    });

    document.getElementById('webapp-copy-btn').addEventListener('click', () => {
        document.getElementById('webapp-direct-link').select();
        document.execCommand('copy');
        triggerToast('Đã copy Direct Link!');
    });

    document.getElementById('webapp-download-qr-btn').addEventListener('click', () => {
        const qrCanvas = qrContainer.querySelector('canvas');
        if (qrCanvas) {
            const a = document.createElement('a');
            a.href = qrCanvas.toDataURL("image/png");
            a.download = 'TrishTeam_QRCode.png';
            a.click();
            triggerToast('Đã tải ảnh QR!');
        }
    });

    document.getElementById('webapp-zalo-btn').addEventListener('click', () => {
        const directUrl = document.getElementById('webapp-direct-link').value;
        navigator.clipboard.writeText(`📁 *TÀI LIỆU TRISH TEAM*\n\n🔗 *Link tải trực tiếp:*\n${directUrl}\n\n📱 _Đính kèm ảnh QR để tải dễ dàng._`).then(() => {
            triggerToast('Đã copy định dạng Zalo! Đang mở app...');
            setTimeout(() => { window.location.href = "zalo://"; }, 800);
        });
    });
}

/* ==================== WEB APP: YOUTUBE DOWNLOADER ==================== */
document.getElementById('yt-download-btn')?.addEventListener('click', () => {
    const url = document.getElementById('yt-link-input').value.trim();
    if(url.includes('youtube.com') || url.includes('youtu.be')) {
        let dl = url.replace('youtube.com', 'ssyoutube.com');
        if(url.includes('youtu.be')) dl = `https://ssyoutube.com/watch?v=${url.split('youtu.be/')[1].split('?')[0]}`;
        window.open(dl, '_blank');
        triggerToast('Đang chuyển hướng tải Video...');
        document.getElementById('yt-link-input').value = '';
    } else triggerToast('Link YouTube không hợp lệ!');
});

/* ==================== WEB APP: THUẬT TOÁN TỨ TRỤ BÁT TỰ ==================== */
document.getElementById('tv-calc-btn')?.addEventListener('click', () => {
    const d = parseInt(document.getElementById('tv-day').value);
    const m = parseInt(document.getElementById('tv-month').value);
    const y = parseInt(document.getElementById('tv-year').value);
    
    if(!d || !m || !y || y < 1900 || y > 2100) { triggerToast('Vui lòng nhập Ngày Tháng Năm sinh hợp lệ!'); return; }

    const Can = ["Canh", "Tân", "Nhâm", "Quý", "Giáp", "Ất", "Bính", "Đinh", "Mậu", "Kỷ"];
    const Chi = ["Thân", "Dậu", "Tuất", "Hợi", "Tý", "Sửu", "Dần", "Mão", "Thìn", "Tỵ", "Ngọ", "Mùi"];
    const NguHanh = ["", "Kim (Vàng)", "Thủy (Nước)", "Hỏa (Lửa)", "Thổ (Đất)", "Mộc (Cây)"];
    
    // Tính Năm
    const canN = Can[y % 10], chiN = Chi[y % 12];
    
    // Tính Tháng (Thuật toán gần đúng tháng Giêng Âm lịch dựa vào Can Năm)
    // Tháng 1 (Dần), Tháng 2 (Mão)...
    const monthChi = Chi[(m + 5) % 12]; // Gần đúng
    
    // Tính Ngũ Hành Bản Mệnh (Dựa trên Năm)
    const canVal = [4, 4, 5, 5, 1, 1, 2, 2, 3, 3][y % 10];
    const chiVal = [1, 1, 2, 2, 0, 0, 1, 1, 2, 2, 0, 0][y % 12];
    let menhVal = canVal + chiVal; if(menhVal > 5) menhVal -= 5;

    document.getElementById('tv-res-year').innerText = `${canN} ${chiN}`;
    document.getElementById('tv-res-month').innerText = `Tháng ${monthChi}`;
    document.getElementById('tv-res-day').innerText = `Ngày ${d}`;
    document.getElementById('tv-res-menh').innerText = NguHanh[menhVal];
    document.getElementById('tv-result').style.display = 'block';
});

/* ==================== WEB APP: TRISH CODEPAD ==================== */
const codeEditor = document.getElementById('code-editor-area');
const lispTemplates = {
    tkl: "; Lệnh: TKL - Tính tổng khối lượng\n(defun c:TKL ( / ss i total val)\n  (prompt \"\\nQuet chon cac text:\")\n  (setq ss (ssget '((0 . \"TEXT\"))))\n  (setq total 0.0 i 0)\n  (while (< i (sslength ss))\n    (setq val (atof (cdr (assoc 1 (entget (ssname ss i))))))\n    (setq total (+ total val))\n    (setq i (1+ i))\n  )\n  (alert (strcat \"Tong khoi luong: \" (rtos total 2 2)))\n  (princ)\n)",
    cd: "; Lệnh: CD - Cắt chân Dim\n(defun c:CD ()\n  (prompt \"\\nChon duong line de cat chan Dim...\")\n  (princ \"\\nDa cat dim thanh cong!\")\n  (princ)\n)"
};

if(codeEditor) {
    codeEditor.addEventListener('keydown', function(e) {
        if (e.key === 'Tab') {
            e.preventDefault();
            const start = this.selectionStart, end = this.selectionEnd;
            this.value = this.value.substring(0, start) + "    " + this.value.substring(end);
            this.selectionStart = this.selectionEnd = start + 4;
        }
    });

    document.getElementById('editor-template').addEventListener('change', (e) => {
        if(e.target.value) { codeEditor.value = lispTemplates[e.target.value]; triggerToast('Đã tải mã LISP mẫu!'); }
    });

    document.getElementById('editor-copy-btn').addEventListener('click', () => {
        if(codeEditor.value) { codeEditor.select(); document.execCommand('copy'); triggerToast('Đã copy Script!'); }
    });

    document.getElementById('editor-clear-btn').addEventListener('click', () => { codeEditor.value = ''; document.getElementById('editor-template').value = ''; });

    document.getElementById('editor-download-btn').addEventListener('click', () => {
        if(!codeEditor.value) { triggerToast('Không có nội dung để tải!'); return; }
        const a = document.createElement('a');
        a.href = URL.createObjectURL(new Blob([codeEditor.value], { type: 'text/plain' }));
        a.download = codeEditor.value.includes('defun') ? 'TrishTeam_Code.lsp' : 'TrishTeam_Note.txt';
        a.click();
        triggerToast('Đã lưu file thành công!');
    });
}

/* ==================== WEB APP: VNEXPRESS RSS SCRAPER ==================== */
const newsContainer = document.getElementById('news-container');
if(newsContainer) {
    fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent('https://vnexpress.net/rss/khoa-hoc.rss')}&api_key=`)
        .then(res => res.json())
        .then(data => {
            if (data.status === 'ok') {
                newsContainer.innerHTML = ''; 
                data.items.slice(0, 8).forEach(item => {
                    let imgSrc = 'https://via.placeholder.com/100x100?text=News';
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

/* ==================== TELEGRAM API ==================== */
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
