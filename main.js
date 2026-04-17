/* MENU SHOW / HIDE */
const navMenu = document.getElementById('nav-menu'),
      navToggle = document.getElementById('nav-toggle'),
      navClose = document.getElementById('nav-close')

if(navToggle){ navToggle.addEventListener('click', () => navMenu.classList.add('show-menu')) }
if(navClose){ navClose.addEventListener('click', () => navMenu.classList.remove('show-menu')) }

const navLink = document.querySelectorAll('.nav__link')
function linkAction(){ navMenu.classList.remove('show-menu') }
navLink.forEach(n => n.addEventListener('click', linkAction))

/* ACTIVE LINK */
const sections = document.querySelectorAll('section[id]')
function scrollActive(){
    const scrollY = window.pageYOffset
    sections.forEach(current =>{
        const sectionHeight = current.offsetHeight,
              sectionTop = current.offsetTop - 58,
              sectionId = current.getAttribute('id')
        if(scrollY > sectionTop && scrollY <= sectionTop + sectionHeight){
            document.querySelector('.nav__menu a[href*=' + sectionId + ']').classList.add('active-link')
        }else{
            document.querySelector('.nav__menu a[href*=' + sectionId + ']').classList.remove('active-link')
        }
    })
}
window.addEventListener('scroll', scrollActive)

/* DARK / LIGHT THEME */
const themeButton = document.getElementById('theme-button')
const darkTheme = 'dark-theme'
const iconTheme = 'fa-sun'

const selectedTheme = localStorage.getItem('selected-theme')
const selectedIcon = localStorage.getItem('selected-icon')
const getCurrentTheme = () => document.body.classList.contains(darkTheme) ? 'dark' : 'light'
const getCurrentIcon = () => themeButton.classList.contains(iconTheme) ? 'fa-moon' : 'fa-sun'

if (selectedTheme) {
  document.body.classList[selectedTheme === 'dark' ? 'add' : 'remove'](darkTheme)
  themeButton.classList[selectedIcon === 'fa-moon' ? 'add' : 'remove'](iconTheme)
}

themeButton.addEventListener('click', () => {
    document.body.classList.toggle(darkTheme)
    themeButton.classList.toggle(iconTheme)
    localStorage.setItem('selected-theme', getCurrentTheme())
    localStorage.setItem('selected-icon', getCurrentIcon())
})

/* ==================== TOAST NOTIFICATION ==================== */
const toast = document.getElementById('toast-notification');
const toastClose = document.getElementById('toast-close');
let toastTimer;

function triggerToast(message = null) {
    if(message) {
        toast.querySelector('.toast__desc').innerText = message;
    }
    toast.classList.add('show');
    
    // Tự động đóng sau 4 giây
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
        toast.classList.remove('show');
    }, 4000);
}

toastClose.addEventListener('click', () => {
    toast.classList.remove('show');
    clearTimeout(toastTimer);
});

// Kích hoạt Toast Welcome sau khi tải trang 1 giây
window.addEventListener('load', () => {
    setTimeout(() => {
        triggerToast("Cảm ơn bạn đã ghé thăm Trish TEAM!");
    }, 1000);
});

/* ==================== FLOATING CHAT WIDGET ==================== */
const chatBtn = document.getElementById('chat-btn');
const chatOptions = document.getElementById('chat-options');
const chatIcon = chatBtn.querySelector('.chat-icon');
const closeIcon = chatBtn.querySelector('.close-icon');

chatBtn.addEventListener('click', () => {
    chatOptions.classList.toggle('show');
    
    // Đổi Icon Chat <-> Dấu X
    if(chatOptions.classList.contains('show')) {
        chatIcon.style.display = 'none';
        closeIcon.style.display = 'block';
        chatBtn.style.animation = 'none'; // Tắt hiệu ứng nhịp đập khi đang mở
    } else {
        chatIcon.style.display = 'block';
        closeIcon.style.display = 'none';
        chatBtn.style.animation = 'pulse 2s infinite';
    }
});
