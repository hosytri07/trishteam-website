/* ==================== MENU & SCROLL ==================== */
const navMenu = document.getElementById('nav-menu'),
      navToggle = document.getElementById('nav-toggle'),
      navClose = document.getElementById('nav-close');

if(navToggle){ navToggle.addEventListener('click', () => navMenu.classList.add('show-menu')); }
if(navClose){ navClose.addEventListener('click', () => navMenu.classList.remove('show-menu')); }

const navLink = document.querySelectorAll('.nav__link');
function linkAction(){ navMenu.classList.remove('show-menu'); }
navLink.forEach(n => n.addEventListener('click', linkAction));

const sections = document.querySelectorAll('section[id]');
function scrollActive(){
    const scrollY = window.pageYOffset;
    sections.forEach(current =>{
        const sectionHeight = current.offsetHeight,
              sectionTop = current.offsetTop - 58,
              sectionId = current.getAttribute('id');
        if(scrollY > sectionTop && scrollY <= sectionTop + sectionHeight){
            document.querySelector('.nav__menu a[href*=' + sectionId + ']').classList.add('active-link');
        }else{
            document.querySelector('.nav__menu a[href*=' + sectionId + ']').classList.remove('active-link');
        }
    });
}
window.addEventListener('scroll', scrollActive);

/* ==================== DARK / LIGHT THEME ==================== */
const themeButton = document.getElementById('theme-button');
const darkTheme = 'dark-theme';
const iconTheme = 'fa-sun';

const selectedTheme = localStorage.getItem('selected-theme');
const selectedIcon = localStorage.getItem('selected-icon');
const getCurrentTheme = () => document.body.classList.contains(darkTheme) ? 'dark' : 'light';
const getCurrentIcon = () => themeButton.classList.contains(iconTheme) ? 'fa-moon' : 'fa-sun';

if (selectedTheme) {
  document.body.classList[selectedTheme === 'dark' ? 'add' : 'remove'](darkTheme);
  themeButton.classList[selectedIcon === 'fa-moon' ? 'add' : 'remove'](iconTheme);
}

themeButton.addEventListener('click', () => {
    document.body.classList.toggle(darkTheme);
    themeButton.classList.toggle(iconTheme);
    localStorage.setItem('selected-theme', getCurrentTheme());
    localStorage.setItem('selected-icon', getCurrentIcon());
});

/* ==================== TOAST NOTIFICATION ==================== */
const toast = document.getElementById('toast-notification');
const toastClose = document.getElementById('toast-close');
let toastTimer;

function triggerToast(message = null) {
    if(message) { toast.querySelector('.toast__desc').innerText = message; }
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { toast.classList.remove('show'); }, 4000);
}

toastClose.addEventListener('click', () => {
    toast.classList.remove('show');
    clearTimeout(toastTimer);
});

window.addEventListener('load', () => {
    setTimeout(() => { triggerToast("Cảm ơn bạn đã ghé thăm Trish TEAM!"); }, 1000);
});

/* ==================== FLOATING CHAT WIDGET ==================== */
const chatBtn = document.getElementById('chat-btn');
const chatOptions = document.getElementById('chat-options');
const chatIcon = chatBtn.querySelector('.chat-icon');
const closeIcon = chatBtn.querySelector('.close-icon');

chatBtn.addEventListener('click', () => {
    chatOptions.classList.toggle('show');
    if(chatOptions.classList.contains('show')) {
        chatIcon.style.display = 'none';
        closeIcon.style.display = 'block';
        chatBtn.style.animation = 'none'; 
    } else {
        chatIcon.style.display = 'block';
        closeIcon.style.display = 'none';
        chatBtn.style.animation = 'pulse 2s infinite';
    }
});

/* ==================== WEB APP - QR & ZALO SHARE ==================== */
const pasteBtn = document.getElementById('webapp-paste-btn');
const generateBtn = document.getElementById('webapp-generate-btn');
const linkInput = document.getElementById('webapp-link-input');
const resultDiv = document.getElementById('webapp-result');
const directLinkInput = document.getElementById('webapp-direct-link');
const copyBtn = document.getElementById('webapp-copy-btn');
const downloadQrBtn = document.getElementById('webapp-download-qr-btn');
const zaloShareBtn = document.getElementById('webapp-zalo-btn');
const qrContainer = document.getElementById('qrcode-container');

if(pasteBtn) {
    pasteBtn.addEventListener('click', async () => {
        try {
            const text = await navigator.clipboard.readText();
            linkInput.value = text;
            triggerToast('Đã dán link từ bộ nhớ tạm!');
        } catch (err) {
            triggerToast('Trình duyệt chặn quyền đọc bộ nhớ tạm. Hãy ấn Ctrl+V.');
        }
    });
}

if(generateBtn) {
    generateBtn.addEventListener('click', () => {
        let url = linkInput.value.trim();
        if(!url) { triggerToast('Vui lòng dán link vào ô nhập liệu!'); return; }

        let directUrl = url;
        const driveRegex = /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/;
        const match = url.match(driveRegex);
        if (match && match[1]) {
            directUrl = `https://drive.google.com/uc?export=download&id=${match[1]}`;
        }

        directLinkInput.value = directUrl;
        qrContainer.innerHTML = ''; 
        
        new QRCode(qrContainer, {
            text: directUrl, width: 160, height: 160,
            colorDark : "#000000", colorLight : "#ffffff", correctLevel : QRCode.CorrectLevel.H
        });

        resultDiv.style.display = 'block';
        triggerToast('Đã tạo mã QR và Link tải trực tiếp!');
    });

    copyBtn.addEventListener('click', () => {
        directLinkInput.select();
        document.execCommand('copy');
        triggerToast('Đã copy Direct Link vào bộ nhớ tạm!');
    });

    downloadQrBtn.addEventListener('click', () => {
        const qrCanvas = qrContainer.querySelector('canvas');
        const qrImage = qrContainer.querySelector('img');
        let imageSrc = '';

        if (qrCanvas) { imageSrc = qrCanvas.toDataURL("image/png"); } 
        else if (qrImage && qrImage.src) { imageSrc = qrImage.src; }

        if (imageSrc) {
            const downloadLink = document.createElement('a');
            downloadLink.href = imageSrc;
            downloadLink.download = 'TrishTeam_QRCode.png';
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
            triggerToast('Đã tải ảnh QR về thiết bị thành công!');
        }
    });

    zaloShareBtn.addEventListener('click', () => {
        const directUrl = directLinkInput.value;
        const formattedText = `📁 *TÀI LIỆU TỪ TRISH TEAM*\n\n🔗 *Link tải trực tiếp (Tốc độ cao):*\n${directUrl}\n\n📱 _Bạn có thể tải ảnh QR trên Web để đính kèm vào hồ sơ._`;
        navigator.clipboard.writeText(formattedText).then(() => {
            triggerToast('Đã copy định dạng chuẩn! Đang mở Zalo...');
            setTimeout(() => { window.location.href = "zalo://"; }, 800);
        });
    });
}

/* ==================== WEB APP - YOUTUBE DOWNLOADER ==================== */
const ytBtn = document.getElementById('yt-download-btn');
const ytInput = document.getElementById('yt-link-input');

if (ytBtn) {
    ytBtn.addEventListener('click', () => {
        const url = ytInput.value.trim();
        if (!url) { triggerToast('Vui lòng dán link YouTube!'); return; }

        if(url.includes('youtube.com') || url.includes('youtu.be')) {
            let downloadUrl = url.replace('youtube.com', 'ssyoutube.com');
            if(url.includes('youtu.be')) {
                const videoId = url.split('youtu.be/')[1].split('?')[0];
                downloadUrl = `https://ssyoutube.com/watch?v=${videoId}`;
            }
            window.open(downloadUrl, '_blank');
            triggerToast('Đang chuyển hướng đến máy chủ tải Video an toàn...');
            ytInput.value = ''; 
        } else {
            triggerToast('Lỗi: Đây không phải là đường link YouTube hợp lệ!');
        }
    });
}

/* ==================== WEB APP - LISP VAULT ==================== */
const lispData = {
    tkl: `<span class="lisp-comment">; Lệnh: TKL - Tính tổng khối lượng</span>\n(<span class="lisp-func">defun</span> c:TKL ( / ss i total ent val)\n  (<span class="lisp-func">prompt</span> <span class="lisp-string">"\\nQuet chon cac text khoi luong: "</span>)\n  (<span class="lisp-func">setq</span> ss (<span class="lisp-func">ssget</span> '((0 . "TEXT"))))\n  (<span class="lisp-func">setq</span> total 0.0 i 0)\n  (<span class="lisp-func">while</span> (<span class="lisp-func">&lt;</span> i (<span class="lisp-func">sslength</span> ss))\n    (<span class="lisp-func">setq</span> val (<span class="lisp-func">atof</span> (<span class="lisp-func">cdr</span> (<span class="lisp-func">assoc</span> 1 (<span class="lisp-func">entget</span> (<span class="lisp-func">ssname</span> ss i))))))\n    (<span class="lisp-func">setq</span> total (<span class="lisp-func">+</span> total val))\n    (<span class="lisp-func">setq</span> i (<span class="lisp-func">1+</span> i))\n  )\n  (<span class="lisp-func">alert</span> (<span class="lisp-func">strcat</span> <span class="lisp-string">"Tong khoi luong: "</span> (<span class="lisp-func">rtos</span> total 2 2)))\n  (<span class="lisp-func">princ</span>)\n)`,
    
    cd: `<span class="lisp-comment">; Lệnh: CD - Cắt bằng chân Dim</span>\n(<span class="lisp-func">defun</span> c:CD ()\n  (<span class="lisp-func">prompt</span> <span class="lisp-string">"\\nChon duong line de cat chan Dim..."</span>)\n  <span class="lisp-comment">; ... Đoạn code thuật toán cắt Dim ...</span>\n  (<span class="lisp-func">princ</span> <span class="lisp-string">"\\nDa cat dim thanh cong!"</span>)\n  (<span class="lisp-func">princ</span>)\n)`,
    
    ntext: `<span class="lisp-comment">; Lệnh: NTEXT - Nối các đoạn Text rời rạc</span>\n(<span class="lisp-func">defun</span> c:NTEXT ( / ss str)\n  (<span class="lisp-func">setq</span> ss (<span class="lisp-func">ssget</span> '((0 . "TEXT"))))\n  (<span class="lisp-func">command</span> <span class="lisp-string">"TXT2MTXT"</span> ss <span class="lisp-string">""</span>)\n  (<span class="lisp-func">princ</span> <span class="lisp-string">"\\nDa noi thanh MTEXT!"</span>)\n  (<span class="lisp-func">princ</span>)\n)`
};

const lispSelect = document.getElementById('lisp-select');
const lispDisplay = document.getElementById('lisp-code-display');
const lispCopyBtn = document.getElementById('lisp-copy-btn');

if(lispSelect) {
    lispDisplay.innerHTML = lispData[lispSelect.value];
    lispSelect.addEventListener('change', (e) => {
        lispDisplay.innerHTML = lispData[e.target.value];
    });
    lispCopyBtn.addEventListener('click', () => {
        const rawCode = lispDisplay.innerText;
        navigator.clipboard.writeText(rawCode).then(() => {
            triggerToast('Đã copy LISP! Hãy dán vào Command Line của AutoCAD.');
        });
    });
}

/* ==================== GỬI PHẢN HỒI QUA TELEGRAM API ==================== */
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
        submitBtn.innerHTML = '<span>Đang gửi...</span> <i class="fas fa-spinner fa-spin button__icon" style="margin-left: 8px;"></i>';
        submitBtn.disabled = true;
        submitBtn.style.opacity = '0.7';
        submitBtn.style.cursor = 'not-allowed';

        try {
            let response;
            if (imageFile) {
                const formData = new FormData();
                formData.append('chat_id', TELEGRAM_CHAT_ID);
                formData.append('photo', imageFile);
                formData.append('caption', text);
                formData.append('parse_mode', 'HTML');
                
                response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`, {
                    method: 'POST',
                    body: formData
                });
            } else {
                response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        chat_id: TELEGRAM_CHAT_ID,
                        text: text,
                        parse_mode: 'HTML'
                    })
                });
            }

            const data = await response.json();
            if (data.ok) {
                triggerToast('Đã gửi phản hồi thành công! Tác giả sẽ nhận được thông báo ngay lập tức.');
                telegramForm.reset(); 
            } else {
                triggerToast('Lỗi hệ thống: Không thể gửi tin nhắn lúc này.');
                console.error("Telegram API Error:", data);
            }
        } catch (error) {
            triggerToast('Lỗi mạng: Vui lòng kiểm tra lại kết nối internet của bạn.');
        } finally {
            submitBtn.innerHTML = originalBtnHTML;
            submitBtn.disabled = false;
            submitBtn.style.opacity = '1';
            submitBtn.style.cursor = 'pointer';
        }
    });
}

/* ==================== WEB APP - CODE EDITOR (NOTEPAD++ CLONE) ==================== */
const codeEditor = document.getElementById('code-editor-area');
const templateSelect = document.getElementById('editor-template');
const codeCopyBtn = document.getElementById('editor-copy-btn');
const codeClearBtn = document.getElementById('editor-clear-btn');
const codeDownloadBtn = document.getElementById('editor-download-btn');

const lispTemplates = {
    tkl: "; Lệnh: TKL - Tính tổng khối lượng\n(defun c:TKL ( / ss i total val)\n  (prompt \"\\nQuet chon cac text:\")\n  (setq ss (ssget '((0 . \"TEXT\"))))\n  (setq total 0.0 i 0)\n  (while (< i (sslength ss))\n    (setq val (atof (cdr (assoc 1 (entget (ssname ss i))))))\n    (setq total (+ total val))\n    (setq i (1+ i))\n  )\n  (alert (strcat \"Tong khoi luong: \" (rtos total 2 2)))\n  (princ)\n)",
    cd: "; Lệnh: CD - Cắt chân Dim\n(defun c:CD ()\n  (prompt \"\\nChon duong line de cat chan Dim...\")\n  ; ... Thuật toán cắt Dim ...\n  (princ \"\\nDa cat dim thanh cong!\")\n  (princ)\n)"
};

if (codeEditor) {
    // 1. Tính năng phím Tab thụt lề
    codeEditor.addEventListener('keydown', function(e) {
        if (e.key === 'Tab') {
            e.preventDefault();
            const start = this.selectionStart;
            const end = this.selectionEnd;
            // Chèn 4 dấu cách thay vì nhảy sang ô khác
            this.value = this.value.substring(0, start) + "    " + this.value.substring(end);
            this.selectionStart = this.selectionEnd = start + 4;
        }
    });

    // 2. Chèn mẫu Code
    templateSelect.addEventListener('change', (e) => {
        if(e.target.value && lispTemplates[e.target.value]) {
            codeEditor.value = lispTemplates[e.target.value];
            triggerToast('Đã tải mẫu LISP thành công!');
        }
    });

    // 3. Copy Code
    codeCopyBtn.addEventListener('click', () => {
        if(!codeEditor.value) return;
        codeEditor.select();
        document.execCommand('copy');
        triggerToast('Đã copy đoạn mã vào bộ nhớ tạm!');
    });

    // 4. Xóa trắng
    codeClearBtn.addEventListener('click', () => {
        codeEditor.value = '';
        templateSelect.value = '';
    });

    // 5. Tải file về máy (.txt hoặc .lsp)
    codeDownloadBtn.addEventListener('click', () => {
        if(!codeEditor.value) { triggerToast('Không có nội dung để tải!'); return; }
        
        // Tạo file ảo trong trình duyệt
        const blob = new Blob([codeEditor.value], { type: 'text/plain' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        // Nếu code có chứa defun c: thì lưu thành .lsp, ngược lại lưu .txt
        a.download = codeEditor.value.includes('defun') ? 'TrishTeam_Code.lsp' : 'TrishTeam_Note.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        triggerToast('Đã tải file thành công!');
    });
}

/* ==================== WEB APP - TÍNH PHONG THỦY (THUẬT TOÁN) ==================== */
const fsInput = document.getElementById('fs-year-input');
const fsBtn = document.getElementById('fs-calc-btn');
const fsResult = document.getElementById('fs-result');
const fsCanchi = document.getElementById('fs-canchi');
const fsMenh = document.getElementById('fs-menh');

if (fsBtn) {
    fsBtn.addEventListener('click', () => {
        const year = parseInt(fsInput.value);
        if(!year || year < 1900 || year > 2100) {
            triggerToast('Vui lòng nhập năm sinh hợp lệ (1900 - 2100)');
            return;
        }

        // Mảng dữ liệu
        const Can = ["Canh", "Tân", "Nhâm", "Quý", "Giáp", "Ất", "Bính", "Đinh", "Mậu", "Kỷ"];
        const Chi = ["Thân", "Dậu", "Tuất", "Hợi", "Tý", "Sửu", "Dần", "Mão", "Thìn", "Tỵ", "Ngọ", "Mùi"];
        const NguHanh = ["", "Kim (Vàng)", "Thủy (Nước)", "Hỏa (Lửa)", "Thổ (Đất)", "Mộc (Cây)"];
        
        // Thuật toán tính Can Chi
        const canIndex = year % 10;
        const chiIndex = year % 12;
        const canChiName = Can[canIndex] + " " + Chi[chiIndex];

        // Thuật toán tính Ngũ Hành (Quy đổi Can/Chi ra hệ số rồi cộng lại)
        const canValue = [4, 4, 5, 5, 1, 1, 2, 2, 3, 3][canIndex];
        const chiValue = [1, 1, 2, 2, 0, 0, 1, 1, 2, 2, 0, 0][chiIndex];
        
        let menhValue = canValue + chiValue;
        if(menhValue > 5) menhValue -= 5; // Vòng lặp ngũ hành
        
        // Hiển thị kết quả
        fsCanchi.innerText = canChiName;
        fsMenh.innerText = NguHanh[menhValue];
        fsResult.style.display = 'block';
    });
}

/* ==================== WEB APP - TIN TỨC RSS (VNEXPRESS KHOA HỌC) ==================== */
const newsContainer = document.getElementById('news-container');

// Dùng API trung gian rss2json để vượt tường lửa CORS
const RSS_URL = 'https://vnexpress.net/rss/khoa-hoc.rss';
const API_URL = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(RSS_URL)}&api_key=`;

if (newsContainer) {
    fetch(API_URL)
        .then(response => response.json())
        .then(data => {
            if (data.status === 'ok') {
                newsContainer.innerHTML = ''; // Xóa chữ "Đang tải"
                const items = data.items.slice(0, 6); // Lấy 6 tin mới nhất
                
                items.forEach(item => {
                    // Cố gắng bóc tách link ảnh thumbnail từ description (vì VNExpress nhúng ảnh trong desc)
                    let imgSrc = 'https://via.placeholder.com/80x80?text=News';
                    const imgMatch = item.description.match(/src="([^"]+)"/);
                    if (imgMatch) imgSrc = imgMatch[1];

                    // Xử lý lại ngày tháng
                    const pubDate = new Date(item.pubDate).toLocaleDateString('vi-VN', {
                        day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
                    });

                    const html = `
                        <div class="news-item">
                            <img src="${imgSrc}" alt="Thumbnail" class="news-img">
                            <div class="news-content">
                                <h4><a href="${item.link}" target="_blank">${item.title}</a></h4>
                                <span class="news-date">${pubDate}</span>
                            </div>
                        </div>
                    `;
                    newsContainer.insertAdjacentHTML('beforeend', html);
                });
            } else {
                newsContainer.innerHTML = '<div style="padding: 1.5rem; text-align: center;">Không thể tải tin tức lúc này.</div>';
            }
        })
        .catch(error => {
            newsContainer.innerHTML = '<div style="padding: 1.5rem; text-align: center;">Lỗi kết nối máy chủ tin tức.</div>';
        });
}
