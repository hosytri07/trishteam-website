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
