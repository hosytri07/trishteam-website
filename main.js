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
    if(message) {
        toast.querySelector('.toast__desc').innerText = message;
    }
    toast.classList.add('show');
    
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
        toast.classList.remove('show');
    }, 4000);
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

/* ==================== WEB APP - QR GENERATOR ==================== */
const generateBtn = document.getElementById('webapp-generate-btn');
const linkInput = document.getElementById('webapp-link-input');
const resultDiv = document.getElementById('webapp-result');
const directLinkInput = document.getElementById('webapp-direct-link');
const copyBtn = document.getElementById('webapp-copy-btn');
const downloadQrBtn = document.getElementById('webapp-download-qr-btn');
const qrContainer = document.getElementById('qrcode-container');

if(generateBtn) {
    generateBtn.addEventListener('click', () => {
        let url = linkInput.value.trim();
        if(!url) {
            triggerToast('Vui lòng dán link vào ô nhập liệu!');
            return;
        }

        // Chuyển link Google Drive thành Direct Download
        let directUrl = url;
        const driveRegex = /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/;
        const match = url.match(driveRegex);
        if (match && match[1]) {
            directUrl = `https://drive.google.com/uc?export=download&id=${match[1]}`;
        }

        // Cập nhật UI
        directLinkInput.value = directUrl;
        qrContainer.innerHTML = ''; // Xóa ảnh QR cũ nếu có
        
        // Sinh mã QR
        new QRCode(qrContainer, {
            text: directUrl,
            width: 180,
            height: 180,
            colorDark : "#000000",
            colorLight : "#ffffff",
            correctLevel : QRCode.CorrectLevel.H
        });

        resultDiv.style.display = 'block';
        triggerToast('Đã tạo mã QR và Link tải trực tiếp!');
    });

    // Tính năng Copy Link
    copyBtn.addEventListener('click', () => {
        directLinkInput.select();
        document.execCommand('copy');
        triggerToast('Đã copy Direct Link vào bộ nhớ tạm!');
    });

    // TÍNH NĂNG MỚI: Tải Ảnh QR về máy
    downloadQrBtn.addEventListener('click', () => {
        // qrcode.js sinh ra thẻ <canvas> hoặc <img> tùy trình duyệt
        const qrCanvas = qrContainer.querySelector('canvas');
        const qrImage = qrContainer.querySelector('img');
        let imageSrc = '';

        if (qrCanvas) {
            imageSrc = qrCanvas.toDataURL("image/png");
        } else if (qrImage && qrImage.src) {
            imageSrc = qrImage.src;
        }

        if (imageSrc) {
            const downloadLink = document.createElement('a');
            downloadLink.href = imageSrc;
            downloadLink.download = 'TrishTeam_QRCode.png'; // Tên file khi tải về
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
            triggerToast('Đã tải ảnh QR về thiết bị thành công!');
        } else {
            triggerToast('Lỗi: Không tìm thấy ảnh QR để tải.');
        }
    });
}

/* ==================== WEB APP - YOUTUBE DOWNLOADER ==================== */
const ytBtn = document.getElementById('yt-download-btn');
const ytInput = document.getElementById('yt-link-input');

if (ytBtn) {
    ytBtn.addEventListener('click', () => {
        const url = ytInput.value.trim();
        if (!url) {
            triggerToast('Vui lòng dán link YouTube!');
            return;
        }

        // Kiểm tra xem có đúng là link YouTube không
        if(url.includes('youtube.com') || url.includes('youtu.be')) {
            // Dùng thủ thuật thay "youtube.com" thành "ssyoutube.com" để bắt link tải trực tiếp
            let downloadUrl = url.replace('youtube.com', 'ssyoutube.com');
            
            // Xử lý riêng định dạng link rút gọn youtu.be
            if(url.includes('youtu.be')) {
                const videoId = url.split('youtu.be/')[1].split('?')[0];
                downloadUrl = `https://ssyoutube.com/watch?v=${videoId}`;
            }
            
            // Mở trang tải video ở một tab mới
            window.open(downloadUrl, '_blank');
            triggerToast('Đang chuyển hướng đến máy chủ tải Video an toàn...');
            ytInput.value = ''; // Xóa trắng ô nhập liệu sau khi bấm
        } else {
            triggerToast('Lỗi: Đây không phải là đường link YouTube hợp lệ!');
        }
    });
}

/* ==================== GỬI PHẢN HỒI QUA TELEGRAM API (CÓ HỖ TRỢ ẢNH) ==================== */
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
                // NẾU CÓ ẢNH -> Dùng API sendPhoto với FormData
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
                // NẾU KHÔNG CÓ ẢNH -> Dùng API sendMessage thông thường
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
