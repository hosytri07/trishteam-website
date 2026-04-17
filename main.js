/* ==================== SCROLL & NAV ==================== */
const sections = document.querySelectorAll('section[id]');
window.addEventListener('scroll', () => {
    const scrollY = window.pageYOffset;
    sections.forEach(current =>{
        const sectionHeight = current.offsetHeight, sectionTop = current.offsetTop - 100, sectionId = current.getAttribute('id');
        if(scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
            document.querySelector('.nav__menu a[href*=' + sectionId + ']')?.classList.add('active-link');
        } else {
            document.querySelector('.nav__menu a[href*=' + sectionId + ']')?.classList.remove('active-link');
        }
    });
});

/* ==================== TOAST & CHAT WIDGET ==================== */
const toast = document.getElementById('toast-notification'); let toastTimer;
function triggerToast(msg) {
    if(msg) toast.querySelector('.toast__desc').innerText = msg;
    toast.classList.add('show'); clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 4000);
}
document.getElementById('toast-close').addEventListener('click', () => toast.classList.remove('show'));
window.addEventListener('load', () => setTimeout(() => triggerToast("Welcome to Trish TEAM Workspace!"), 1000));

const chatBtn = document.getElementById('chat-btn'), chatOptions = document.getElementById('chat-options');
chatBtn.addEventListener('click', () => {
    chatOptions.classList.toggle('show');
    chatBtn.querySelector('.chat-icon').style.display = chatOptions.classList.contains('show') ? 'none' : 'block';
    chatBtn.querySelector('.close-icon').style.display = chatOptions.classList.contains('show') ? 'block' : 'none';
    chatBtn.style.animation = chatOptions.classList.contains('show') ? 'none' : 'pulse 2s infinite';
});

/* ==================== TOOL 1: QR & ZALO SHARE ==================== */
const qrContainer = document.getElementById('qrcode-container');
document.getElementById('webapp-paste-btn')?.addEventListener('click', async () => {
    try { document.getElementById('webapp-link-input').value = await navigator.clipboard.readText(); triggerToast('Đã dán link!'); } 
    catch(err) { triggerToast('Trình duyệt chặn quyền dán. Hãy ấn Ctrl+V.'); }
});

document.getElementById('webapp-generate-btn')?.addEventListener('click', () => {
    let url = document.getElementById('webapp-link-input').value.trim();
    if(!url) { triggerToast('Vui lòng dán link Google Drive!'); return; }
    let directUrl = url;
    const match = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (match) directUrl = `https://drive.google.com/uc?export=download&id=${match[1]}`;

    document.getElementById('webapp-direct-link').value = directUrl;
    qrContainer.innerHTML = ''; 
    new QRCode(qrContainer, { text: directUrl, width: 160, height: 160, colorDark: "#0f172a", colorLight: "#ffffff", correctLevel: QRCode.CorrectLevel.H });
    document.getElementById('webapp-result').style.display = 'block';
    triggerToast('Đã tạo mã QR thành công!');
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
    navigator.clipboard.writeText(`📁 *TÀI LIỆU TRISH TEAM*\n\n🔗 *Link tải trực tiếp:*\n${document.getElementById('webapp-direct-link').value}\n\n📱 _Đính kèm ảnh QR để tải trên điện thoại._`).then(() => {
        triggerToast('Đang mở Zalo...'); setTimeout(() => { window.location.href = "zalo://"; }, 800);
    });
});

/* ==================== TOOL 2: TỬ VI (THUẬT TOÁN CHUẨN VIỆT NAM) ==================== */
document.getElementById('tv-calc-btn')?.addEventListener('click', () => {
    const d = parseInt(document.getElementById('tv-day').value);
    const m = parseInt(document.getElementById('tv-month').value);
    const y = parseInt(document.getElementById('tv-year').value);
    const gender = parseInt(document.getElementById('tv-gender').value); 
    
    if(!d || !m || !y || y < 1900 || y > 2100) { triggerToast('Vui lòng nhập Ngày/Tháng/Năm sinh hợp lệ!'); return; }

    // 1. Thần số học
    let sumString = `${d}${m}${y}`; let lifePath = 0;
    while(sumString.length > 1) {
        lifePath = sumString.split('').reduce((a, b) => parseInt(a) + parseInt(b), 0);
        if(lifePath === 11 || lifePath === 22 || lifePath === 33) break;
        sumString = lifePath.toString();
    }
    document.getElementById('tv-res-numerology').innerText = lifePath;

    // 2. Cung Hoàng Đạo
    const zodiacs = ["Ma Kết", "Bảo Bình", "Song Ngư", "Bạch Dương", "Kim Ngưu", "Song Tử", "Cự Giải", "Sư Tử", "Xử Nữ", "Thiên Bình", "Bọ Cạp", "Nhân Mã"];
    const zDates = [20, 19, 21, 20, 21, 22, 23, 23, 23, 24, 22, 22];
    let zIdx = m - 1; if(d < zDates[zIdx]) zIdx = (zIdx - 1 + 12) % 12;
    document.getElementById('tv-res-zodiac').innerText = zodiacs[zIdx];

    // 3. Tính Can Chi & Mệnh bằng TOÁN HỌC (Không dùng Tiếng Trung của Thư viện Lunar)
    const canArr = ["Canh","Tân","Nhâm","Quý","Giáp","Ất","Bính","Đinh","Mậu","Kỷ"];
    const chiArr = ["Thân","Dậu","Tuất","Hợi","Tý","Sửu","Dần","Mão","Thìn","Tỵ","Ngọ","Mùi"];
    const canIndex = y % 10;
    const chiIndex = y % 12;
    const namCanChi = `${canArr[canIndex]} ${chiArr[chiIndex]}`;
    
    document.getElementById('tv-res-canchi').innerText = `Năm ${namCanChi}`;
    
    // Mệnh
    const canVal = [4,4,5,5,1,1,2,2,3,3][canIndex];
    const chiVal = [1,1,2,2,0,0,1,1,2,2,0,0][chiIndex];
    let menhNum = canVal + chiVal; if(menhNum > 5) menhNum -= 5;
    const menhMap = ["", "Kim (Vàng)", "Thủy (Nước)", "Hỏa (Lửa)", "Thổ (Đất)", "Mộc (Cây)"];
    document.getElementById('tv-res-menh').innerText = menhMap[menhNum];
    
    // Cung Phi
    let ySum = y.toString().split('').reduce((a, b) => parseInt(a) + parseInt(b), 0);
    while(ySum > 9) ySum = ySum.toString().split('').reduce((a, b) => parseInt(a) + parseInt(b), 0);
    let cungNum = gender === 1 ? (11 - ySum) : (4 + ySum); if(cungNum > 9) cungNum -= 9;
    
    const cungMapNam = {1:"Khảm (Thủy)", 2:"Khôn (Thổ)", 3:"Chấn (Mộc)", 4:"Tốn (Mộc)", 5:"Khôn (Thổ)", 6:"Càn (Kim)", 7:"Đoài (Kim)", 8:"Cấn (Thổ)", 9:"Ly (Hỏa)"};
    const cungMapNu = {1:"Cấn (Thổ)", 2:"Càn (Kim)", 3:"Đoài (Kim)", 4:"Cấn (Thổ)", 5:"Ly (Hỏa)", 6:"Khảm (Thủy)", 7:"Khôn (Thổ)", 8:"Chấn (Mộc)", 9:"Tốn (Mộc)"};
    document.getElementById('tv-res-cung').innerText = gender === 1 ? cungMapNam[cungNum] : cungMapNu[cungNum];
    document.getElementById('tv-res-huong').innerText = [1,3,4,9].includes(cungNum) ? "Đông, Nam, Bắc, Đông Nam" : "Tây, Tây Bắc, Tây Nam, Đông Bắc";
    
    const colorMap = {1: "Trắng, Xám, Vàng", 2: "Đen, Xanh dương, Trắng", 3: "Xanh lá, Đỏ, Tím", 4: "Đỏ, Vàng, Nâu", 5: "Xanh biển, Đen, Xanh lá"};
    document.getElementById('tv-res-color').innerText = colorMap[menhNum];
    document.getElementById('tv-result').style.display = 'block';
});

/* ==================== 3. TOOL: THỊ TRƯỜNG & LỊCH (REAL-TIME API) ==================== */
window.addEventListener('DOMContentLoaded', () => {
    // A. Lịch Vạn Niên
    const today = new Date();
    document.getElementById('cal-solar').innerText = `${today.getDate().toString().padStart(2,'0')}/${(today.getMonth()+1).toString().padStart(2,'0')}/${today.getFullYear()}`;
    if(typeof Lunar !== 'undefined') {
        const lunar = Lunar.fromDate(today);
        document.getElementById('cal-lunar').innerText = `Âm lịch: Mùng ${lunar.getDay()} tháng ${lunar.getMonth()}`;
        // Tính countdown Lễ
        const hols = [{n:"Giải phóng MN", d:30, m:4},{n:"Tết Nguyên Đán", d:1, m:1, l:true}];
        document.getElementById('holiday-info').innerText = "Sắp tới: Giải phóng Miền Nam 30/04";
    }

    // B. Cào dữ liệu Vàng SJC (Dùng AllOrigins Proxy để vượt CORS)
    fetch('https://api.allorigins.win/get?url=' + encodeURIComponent('https://sjc.com.vn/xml/tygiavang.xml'))
    .then(r => r.json())
    .then(data => {
        const parser = new DOMParser();
        const xml = parser.parseFromString(data.contents, "application/xml");
        // Tìm thẻ Vàng SJC HCM
        const sjc = xml.querySelector('city[name="Hồ Chí Minh"] item');
        if(sjc) {
            const sellPrice = parseFloat(sjc.getAttribute('sell')) * 1000000; // API trả về dạng 83.800
            document.getElementById('market-gold').innerHTML = sellPrice.toLocaleString('vi-VN') + " ₫ <span style='font-size:0.8rem; color:#34d399;'><i class='fas fa-caret-up'></i> Live</span>";
        }
    }).catch(e => console.log('Lỗi API Vàng:', e));

    // C. Cào dữ liệu Tỷ giá Vietcombank
    fetch('https://api.allorigins.win/get?url=' + encodeURIComponent('https://portal.vietcombank.com.vn/Usercontrols/TVPortal.TyGia/pXML.aspx'))
    .then(r => r.json())
    .then(data => {
        const parser = new DOMParser();
        const xml = parser.parseFromString(data.contents, "application/xml");
        const usd = xml.querySelector('Exrate[CurrencyCode="USD"]');
        if(usd) {
            document.getElementById('market-usd').innerHTML = usd.getAttribute('Sell') + " ₫ <span style='font-size:0.8rem; color:#34d399;'><i class='fas fa-caret-up'></i> Live</span>";
        }
    }).catch(e => console.log('Lỗi API VCB:', e));
});

/* ==================== 4. TOOL: CODEPAD ==================== */
const codeEditor = document.getElementById('code-editor-area');
const lispTemplates = {
    tkl: "; Lệnh: TKL - Tính tổng khối lượng\n(defun c:TKL ( / ss i total val)\n  (prompt \"\\nQuet chon cac text:\")\n  (setq ss (ssget '((0 . \"TEXT\"))))\n  (setq total 0.0 i 0)\n  (while (< i (sslength ss))\n    (setq val (atof (cdr (assoc 1 (entget (ssname ss i))))))\n    (setq total (+ total val))\n    (setq i (1+ i))\n  )\n  (alert (strcat \"Tong khoi luong: \" (rtos total 2 2)))\n  (princ)\n)",
    cd: "; Lệnh: CD - Cắt chân Dim\n(defun c:CD ()\n  (prompt \"\\nChon duong line de cat chan Dim...\")\n  (princ \"\\nDa cat dim thanh cong!\")\n  (princ)\n)",
    ntext: "; Lệnh: NTEXT - Nối các đoạn Text rời rạc\n(defun c:NTEXT ( / ss str)\n  (setq ss (ssget '((0 . \"TEXT\"))))\n  (command \"TXT2MTXT\" ss \"\")\n  (princ \"\\nDa noi thanh MTEXT!\")\n  (princ)\n)"
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

/* ==================== 5. FORM TELEGRAM ==================== */
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
        
        const text = `📬 <b>PHẢN HỒI MỚI TỪ WEBSITE</b>\n\n👤 <b>Tên:</b> ${name}\n📧 <b>Email:</b> ${email}\n💬 <b>Nội dung:</b>\n${message}`;
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
