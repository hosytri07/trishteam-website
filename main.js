// ==================== GLOBAL STATE ====================
const state = {
    currentTool: null,
    theme: localStorage.getItem('theme') || 'dark',
    qrCodeInstance: null
};

// ==================== UTILITY FUNCTIONS ====================
const showToast = (message, duration = 3000) => {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toast-message');
    toastMessage.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), duration);
};

const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

const copyToClipboard = async (text) => {
    try {
        await navigator.clipboard.writeText(text);
        showToast('✓ Đã sao chép vào clipboard');
        return true;
    } catch (err) {
        showToast('✗ Không thể sao chép');
        return false;
    }
};

// ==================== THEME ====================
const initTheme = () => {
    document.body.setAttribute('data-theme', state.theme);
    const icon = document.querySelector('#theme-toggle i');
    icon.className = state.theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
};

const toggleTheme = () => {
    state.theme = state.theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('theme', state.theme);
    initTheme();
    showToast(`Đã chuyển sang ${state.theme === 'dark' ? 'Dark' : 'Light'} Mode`);
};

// ==================== NAVIGATION ====================
const initNavigation = () => {
    const navbar = document.getElementById('navbar');
    const menuToggle = document.getElementById('menu-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    
    // Sticky navbar
    let lastScroll = 0;
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll <= 0) {
            navbar.style.transform = 'translateY(0)';
        } else if (currentScroll > lastScroll && currentScroll > 100) {
            navbar.style.transform = 'translateY(-100%)';
        } else {
            navbar.style.transform = 'translateY(0)';
        }
        
        lastScroll = currentScroll;
        
        // Show scroll to top button
        const scrollTopBtn = document.getElementById('scroll-top');
        if (currentScroll > 500) {
            scrollTopBtn.classList.add('show');
        } else {
            scrollTopBtn.classList.remove('show');
        }
    });
    
    // Mobile menu toggle
    menuToggle.addEventListener('click', () => {
        menuToggle.classList.toggle('active');
        navMenu.classList.toggle('active');
    });
    
    // Active link on scroll
    const sections = document.querySelectorAll('section[id]');
    window.addEventListener('scroll', () => {
        const scrollY = window.pageYOffset;
        
        sections.forEach(section => {
            const sectionHeight = section.offsetHeight;
            const sectionTop = section.offsetTop - 100;
            const sectionId = section.getAttribute('id');
            
            if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    });
    
    // Smooth scroll
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            if (link.getAttribute('href').startsWith('#')) {
                e.preventDefault();
                const target = document.querySelector(link.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    navMenu.classList.remove('active');
                    menuToggle.classList.remove('active');
                }
            }
        });
    });
};

// ==================== TOOLS FILTER ====================
const initToolsFilter = () => {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const toolCards = document.querySelectorAll('.tool-card');
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Update active button
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const filter = btn.dataset.filter;
            
            // Filter tools
            toolCards.forEach(card => {
                if (filter === 'all' || card.dataset.category === filter) {
                    card.style.display = 'block';
                    card.style.animation = 'fadeInUp 0.5s ease-out';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });
};

// ==================== TOOL MODAL ====================
const openToolModal = (toolId) => {
    const modal = document.getElementById('tool-modal');
    const modalBody = document.getElementById('modal-body');
    
    // Load tool content
    modalBody.innerHTML = getToolContent(toolId);
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Initialize tool-specific functionality
    initToolFunctionality(toolId);
};

const closeToolModal = () => {
    const modal = document.getElementById('tool-modal');
    modal.classList.remove('active');
    document.body.style.overflow = '';
};

// ==================== MYSTICAL MODAL ====================
const openMysticalModal = (mysticalId) => {
    const modal = document.getElementById('tool-modal');
    const modalBody = document.getElementById('modal-body');
    
    modalBody.innerHTML = getMysticalContent(mysticalId);
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    initMysticalFunctionality(mysticalId);
};

// ==================== QR GENERATOR ====================
const getToolContent = (toolId) => {
    const tools = {
        'qr-generator': `
            <div class="tool-content">
                <h2 class="tool-content-title"><i class="fas fa-qrcode"></i> QR Generator</h2>
                <p class="tool-content-desc">Tạo mã QR và link tải trực tiếp từ Google Drive</p>
                
                <div class="input-container">
                    <label>Link Google Drive:</label>
                    <div class="input-with-btn">
                        <input type="text" id="qr-input" placeholder="https://drive.google.com/file/d/..." class="input-field">
                        <button onclick="pasteFromClipboard('qr-input')" class="btn-icon" title="Dán">
                            <i class="fas fa-paste"></i>
                        </button>
                    </div>
                </div>
                
                <button onclick="generateQR()" class="btn btn-primary btn-block">
                    <i class="fas fa-magic"></i> Tạo QR Code
                </button>
                
                <div id="qr-result" class="result-container" style="display: none;">
                    <div id="qrcode" class="qr-container"></div>
                    <div class="input-container">
                        <label>Direct Link:</label>
                        <input type="text" id="direct-link" readonly class="input-field">
                    </div>
                    <div class="button-group">
                        <button onclick="copyDirectLink()" class="btn btn-secondary">
                            <i class="fas fa-copy"></i> Copy Link
                        </button>
                        <button onclick="downloadQR()" class="btn btn-secondary">
                            <i class="fas fa-download"></i> Tải QR
                        </button>
                    </div>
                </div>
            </div>
        `,
        
        'password-gen': `
            <div class="tool-content">
                <h2 class="tool-content-title"><i class="fas fa-key"></i> Password Generator</h2>
                <p class="tool-content-desc">Tạo mật khẩu mạnh và an toàn</p>
                
                <div class="password-options">
                    <div class="option-group">
                        <label>Độ dài: <span id="length-value">16</span></label>
                        <input type="range" id="password-length" min="8" max="32" value="16" oninput="document.getElementById('length-value').textContent = this.value">
                    </div>
                    <div class="checkbox-group">
                        <label><input type="checkbox" id="include-uppercase" checked> Chữ hoa (A-Z)</label>
                        <label><input type="checkbox" id="include-lowercase" checked> Chữ thường (a-z)</label>
                        <label><input type="checkbox" id="include-numbers" checked> Số (0-9)</label>
                        <label><input type="checkbox" id="include-symbols" checked> Ký tự (!@#$%)</label>
                    </div>
                </div>
                
                <button onclick="generatePassword()" class="btn btn-primary btn-block">
                    <i class="fas fa-sync"></i> Tạo mật khẩu
                </button>
                
                <div id="password-result" class="result-container" style="display: none;">
                    <div class="password-display">
                        <input type="text" id="generated-password" readonly class="input-field password-field">
                        <button onclick="copyPassword()" class="btn-icon" title="Copy">
                            <i class="fas fa-copy"></i>
                        </button>
                    </div>
                    <div class="password-strength">
                        <div class="strength-bar">
                            <div id="strength-bar-fill" class="strength-bar-fill"></div>
                        </div>
                        <span id="strength-text"></span>
                    </div>
                </div>
            </div>
        `,
        
        'color-picker': `
            <div class="tool-content">
                <h2 class="tool-content-title"><i class="fas fa-palette"></i> Color Picker</h2>
                <p class="tool-content-desc">Chọn màu và tạo gradient đẹp</p>
                
                <div class="color-picker-container">
                    <div class="color-input-group">
                        <label>Màu 1:</label>
                        <input type="color" id="color1" value="#667eea" onchange="updateGradient()">
                        <input type="text" id="color1-hex" value="#667eea" oninput="updateColorFromHex('color1', this.value)">
                    </div>
                    <div class="color-input-group">
                        <label>Màu 2:</label>
                        <input type="color" id="color2" value="#764ba2" onchange="updateGradient()">
                        <input type="text" id="color2-hex" value="#764ba2" oninput="updateColorFromHex('color2', this.value)">
                    </div>
                </div>
                
                <div class="gradient-preview" id="gradient-preview"></div>
                
                <div class="input-container">
                    <label>CSS Gradient:</label>
                    <textarea id="gradient-css" readonly rows="3" class="input-field"></textarea>
                </div>
                
                <button onclick="copyGradientCSS()" class="btn btn-primary btn-block">
                    <i class="fas fa-copy"></i> Copy CSS
                </button>
            </div>
        `,
        
        'base64': `
            <div class="tool-content">
                <h2 class="tool-content-title"><i class="fas fa-code"></i> Base64 Encoder/Decoder</h2>
                <p class="tool-content-desc">Mã hóa và giải mã Base64</p>
                
                <div class="tabs">
                    <button onclick="switchTab('encode')" class="tab-btn active" id="tab-encode">Encode</button>
                    <button onclick="switchTab('decode')" class="tab-btn" id="tab-decode">Decode</button>
                </div>
                
                <div id="encode-tab" class="tab-content active">
                    <div class="input-container">
                        <label>Văn bản gốc:</label>
                        <textarea id="base64-input" rows="5" class="input-field" placeholder="Nhập văn bản cần mã hóa..."></textarea>
                    </div>
                    <button onclick="encodeBase64()" class="btn btn-primary btn-block">
                        <i class="fas fa-lock"></i> Encode
                    </button>
                </div>
                
                <div id="decode-tab" class="tab-content">
                    <div class="input-container">
                        <label>Base64:</label>
                        <textarea id="base64-encoded" rows="5" class="input-field" placeholder="Nhập Base64 cần giải mã..."></textarea>
                    </div>
                    <button onclick="decodeBase64()" class="btn btn-primary btn-block">
                        <i class="fas fa-unlock"></i> Decode
                    </button>
                </div>
                
                <div id="base64-result" class="result-container" style="display: none;">
                    <div class="input-container">
                        <label>Kết quả:</label>
                        <textarea id="base64-output" rows="5" readonly class="input-field"></textarea>
                    </div>
                    <button onclick="copyBase64Result()" class="btn btn-secondary">
                        <i class="fas fa-copy"></i> Copy
                    </button>
                </div>
            </div>
        `
    };
    
    return tools[toolId] || '<p>Tool đang được phát triển...</p>';
};

// ==================== INITIALIZE ====================
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initNavigation();
    initToolsFilter();
    loadUtilities();
    
    // Theme toggle
    document.getElementById('theme-toggle').addEventListener('click', toggleTheme);
    
    // Tool cards click
    document.querySelectorAll('.tool-card').forEach(card => {
        card.addEventListener('click', () => {
            const toolId = card.dataset.tool;
            openToolModal(toolId);
        });
    });
    
    // Mystical cards click
    document.querySelectorAll('.mystical-card').forEach(card => {
        card.addEventListener('click', () => {
            const mysticalId = card.dataset.mystical;
            openMysticalModal(mysticalId);
        });
    });
    
    // Modal close
    document.getElementById('modal-close').addEventListener('click', closeToolModal);
    document.querySelector('.modal-overlay').addEventListener('click', closeToolModal);
    
    // Scroll to top
    document.getElementById('scroll-top').addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    
    // Contact form
    document.getElementById('contact-form').addEventListener('submit', handleContactForm);
});

// Contact form handler
const handleContactForm = async (e) => {
    e.preventDefault();
    
    const name = document.getElementById('contact-name').value.trim();
    const email = document.getElementById('contact-email').value.trim();
    const message = document.getElementById('contact-message').value.trim();
    const btn = e.target.querySelector('button[type="submit"]');

    if (!name || !email || !message) {
        showToast('✗ Vui lòng điền đầy đủ thông tin!');
        return;
    }

    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang gửi...';

    const BOT_TOKEN = '8668861015:AAES7-vHAOuuV2D4Nk2budyQIzgZ9arIYRU';
    const CHAT_ID = '1687867690';
    const now = new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
    const text = `📬 <b>Liên hệ mới — TrishTeam</b>\n\n👤 <b>Tên:</b> ${name}\n📧 <b>Email:</b> ${email}\n💬 <b>Nội dung:</b>\n${message}\n\n🕐 ${now}`;

    try {
        const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: CHAT_ID, text, parse_mode: 'HTML' })
        });
        const data = await res.json();
        if (data.ok) {
            showToast('✓ Tin nhắn đã được gửi thành công!');
            e.target.reset();
        } else {
            throw new Error(data.description || 'Telegram error');
        }
    } catch (err) {
        console.error('Telegram error:', err);
        showToast('✗ Lỗi gửi tin nhắn. Vui lòng thử lại sau!');
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-paper-plane"></i> Gửi tin nhắn';
    }
};

// ==================== TOOL FUNCTIONS ====================

// QR Generator Functions
const initToolFunctionality = (toolId) => {
    if (toolId === 'qr-generator') {
        // Initialize QR code container
    } else if (toolId === 'color-picker') {
        updateGradient();
    }
};

const pasteFromClipboard = async (inputId) => {
    try {
        const text = await navigator.clipboard.readText();
        document.getElementById(inputId).value = text;
        showToast('✓ Đã dán từ clipboard');
    } catch (err) {
        showToast('✗ Không thể dán');
    }
};

const generateQR = () => {
    const input = document.getElementById('qr-input').value.trim();
    
    if (!input) {
        showToast('✗ Vui lòng nhập link Google Drive');
        return;
    }
    
    let directLink = input;
    
    // Convert Google Drive link to direct link
    if (input.includes('drive.google.com')) {
        const match = input.match(/\/d\/(.*?)(\/|$)/);
        if (match && match[1]) {
            directLink = `https://drive.google.com/uc?export=download&id=${match[1]}`;
        }
    }
    
    // Show result
    const resultDiv = document.getElementById('qr-result');
    const qrcodeDiv = document.getElementById('qrcode');
    const directLinkInput = document.getElementById('direct-link');
    
    qrcodeDiv.innerHTML = '';
    directLinkInput.value = directLink;
    resultDiv.style.display = 'block';
    
    // Generate QR Code
    if (typeof QRCode !== 'undefined') {
        state.qrCodeInstance = new QRCode(qrcodeDiv, {
            text: directLink,
            width: 256,
            height: 256,
            colorDark: '#000000',
            colorLight: '#ffffff',
            correctLevel: QRCode.CorrectLevel.H
        });
    }
    
    showToast('✓ QR Code đã được tạo');
};

const copyDirectLink = () => {
    const link = document.getElementById('direct-link').value;
    copyToClipboard(link);
};

const downloadQR = () => {
    const qrCanvas = document.querySelector('#qrcode canvas');
    if (qrCanvas) {
        const url = qrCanvas.toDataURL('image/png');
        const a = document.createElement('a');
        a.href = url;
        a.download = 'qrcode.png';
        a.click();
        showToast('✓ QR Code đã được tải xuống');
    }
};

// Password Generator Functions
const generatePassword = () => {
    const length = parseInt(document.getElementById('password-length').value);
    const includeUppercase = document.getElementById('include-uppercase').checked;
    const includeLowercase = document.getElementById('include-lowercase').checked;
    const includeNumbers = document.getElementById('include-numbers').checked;
    const includeSymbols = document.getElementById('include-symbols').checked;
    
    let chars = '';
    if (includeUppercase) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (includeLowercase) chars += 'abcdefghijklmnopqrstuvwxyz';
    if (includeNumbers) chars += '0123456789';
    if (includeSymbols) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?';
    
    if (chars === '') {
        showToast('✗ Vui lòng chọn ít nhất một loại ký tự');
        return;
    }
    
    let password = '';
    for (let i = 0; i < length; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    document.getElementById('generated-password').value = password;
    document.getElementById('password-result').style.display = 'block';
    
    // Calculate strength
    calculatePasswordStrength(password);
    showToast('✓ Mật khẩu đã được tạo');
};

const calculatePasswordStrength = (password) => {
    let strength = 0;
    const strengthBar = document.getElementById('strength-bar-fill');
    const strengthText = document.getElementById('strength-text');
    
    if (password.length >= 8) strength += 25;
    if (password.length >= 12) strength += 25;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 20;
    if (/\d/.test(password)) strength += 15;
    if (/[^a-zA-Z0-9]/.test(password)) strength += 15;
    
    strengthBar.style.width = strength + '%';
    
    if (strength < 40) {
        strengthBar.style.background = '#ef4444';
        strengthText.textContent = 'Yếu';
        strengthText.style.color = '#ef4444';
    } else if (strength < 70) {
        strengthBar.style.background = '#f59e0b';
        strengthText.textContent = 'Trung bình';
        strengthText.style.color = '#f59e0b';
    } else {
        strengthBar.style.background = '#10b981';
        strengthText.textContent = 'Mạnh';
        strengthText.style.color = '#10b981';
    }
};

const copyPassword = () => {
    const password = document.getElementById('generated-password').value;
    copyToClipboard(password);
};

// Color Picker Functions
const updateGradient = () => {
    const color1 = document.getElementById('color1').value;
    const color2 = document.getElementById('color2').value;
    const preview = document.getElementById('gradient-preview');
    const cssOutput = document.getElementById('gradient-css');
    
    document.getElementById('color1-hex').value = color1;
    document.getElementById('color2-hex').value = color2;
    
    const gradient = `linear-gradient(135deg, ${color1} 0%, ${color2} 100%)`;
    preview.style.background = gradient;
    cssOutput.value = `background: ${gradient};`;
};

const updateColorFromHex = (colorInputId, hex) => {
    if (/^#[0-9A-F]{6}$/i.test(hex)) {
        document.getElementById(colorInputId).value = hex;
        updateGradient();
    }
};

const copyGradientCSS = () => {
    const css = document.getElementById('gradient-css').value;
    copyToClipboard(css);
};

// Base64 Functions
const switchTab = (tabName) => {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    
    document.getElementById(`tab-${tabName}`).classList.add('active');
    document.getElementById(`${tabName}-tab`).classList.add('active');
};

const encodeBase64 = () => {
    const input = document.getElementById('base64-input').value;
    
    if (!input) {
        showToast('✗ Vui lòng nhập văn bản');
        return;
    }
    
    try {
        const encoded = btoa(unescape(encodeURIComponent(input)));
        document.getElementById('base64-output').value = encoded;
        document.getElementById('base64-result').style.display = 'block';
        showToast('✓ Đã mã hóa thành công');
    } catch (err) {
        showToast('✗ Lỗi khi mã hóa');
    }
};

const decodeBase64 = () => {
    const input = document.getElementById('base64-encoded').value;
    
    if (!input) {
        showToast('✗ Vui lòng nhập Base64');
        return;
    }
    
    try {
        const decoded = decodeURIComponent(escape(atob(input)));
        document.getElementById('base64-output').value = decoded;
        document.getElementById('base64-result').style.display = 'block';
        showToast('✓ Đã giải mã thành công');
    } catch (err) {
        showToast('✗ Lỗi khi giải mã');
    }
};

const copyBase64Result = () => {
    const result = document.getElementById('base64-output').value;
    copyToClipboard(result);
};

// ==================== UTILITIES DATA ====================
const loadUtilities = async () => {
    await Promise.all([
        loadGoldPrice(),
        loadUSDRate(),
        loadGasolinePrice(),
        loadLunarDate()
    ]);
};

const loadGoldPrice = async () => {
    const priceEl = document.getElementById('gold-price');
    const updateEl = document.getElementById('gold-update');
    
    try {
        // Simulate API call (replace with actual API)
        await new Promise(resolve => setTimeout(resolve, 1000));
        const price = 76500000; // Mock data
        priceEl.innerHTML = formatNumber(price);
        
        const now = new Date();
        updateEl.textContent = now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    } catch (err) {
        priceEl.textContent = 'N/A';
    }
};

const loadUSDRate = async () => {
    const rateEl = document.getElementById('usd-rate');
    
    try {
        await new Promise(resolve => setTimeout(resolve, 1200));
        const rate = 24250; // Mock data
        rateEl.innerHTML = formatNumber(rate);
    } catch (err) {
        rateEl.textContent = 'N/A';
    }
};

const loadWeather = async () => {
    const tempEl = document.getElementById('weather-temp');
    const descEl = document.getElementById('weather-desc');
    
    try {
        await new Promise(resolve => setTimeout(resolve, 1500));
        tempEl.innerHTML = '28°C';
        descEl.textContent = 'Nắng đẹp';
    } catch (err) {
        tempEl.textContent = 'N/A';
        descEl.textContent = 'Không có dữ liệu';
    }
};

const loadGasolinePrice = async () => {
    const priceEl = document.getElementById('gasoline-price');
    
    try {
        await new Promise(resolve => setTimeout(resolve, 1300));
        const price = 22450; // Mock data - replace with actual API
        priceEl.innerHTML = formatNumber(price);
    } catch (err) {
        priceEl.textContent = 'N/A';
    }
};

const loadLunarDate = async () => {
    const dateEl = document.getElementById('lunar-date');
    const yearEl = document.getElementById('lunar-year');
    const holidayEl = document.getElementById('lunar-holiday');
    
    try {
        if (typeof Lunar !== 'undefined') {
            const today = new Date();
            const lunar = Lunar.fromDate(today);
            
            dateEl.textContent = `${lunar.getDay()}/${lunar.getMonth()}`;
            yearEl.textContent = `Năm ${lunar.getYearInGanZhi()}`;
            
            // Check for holidays
            const festivals = lunar.getFestivals();
            if (festivals && festivals.length > 0) {
                holidayEl.textContent = festivals[0];
            } else {
                holidayEl.textContent = 'Không có sự kiện';
            }
        } else {
            throw new Error('Lunar library not loaded');
        }
    } catch (err) {
        dateEl.textContent = 'N/A';
        yearEl.textContent = '---';
    }
};

// ==================== SOFTWARE SECTION ====================
const initSoftwareTabs = () => {
    const tabs = document.querySelectorAll('.software-tab');
    const contents = document.querySelectorAll('.software-content');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetTab = tab.dataset.tab;
            
            // Update active tab
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // Update active content
            contents.forEach(content => {
                if (content.id === targetTab) {
                    content.classList.add('active');
                } else {
                    content.classList.remove('active');
                }
            });
        });
    });
    
    // Idea form submission
    const ideaForm = document.getElementById('idea-form');
    if (ideaForm) {
        ideaForm.addEventListener('submit', (e) => {
            e.preventDefault();
            showToast('✓ Cảm ơn bạn đã đóng góp ý tưởng!');
            ideaForm.reset();
        });
    }
};

const downloadSoftware = (softwareId) => {
    // In real app, this would trigger actual download
    showToast(`Đang tải xuống ${softwareId.toUpperCase()}...`);
    
    // Simulate download
    setTimeout(() => {
        showToast('✓ Tải xuống thành công!');
    }, 2000);
};

const viewSoftwareDetails = (softwareId) => {
    const modal = document.getElementById('tool-modal');
    const modalBody = document.getElementById('modal-body');
    
    const softwareDetails = {
        'tkl': {
            title: 'TKL - Tính Khối Lượng',
            icon: 'fa-layer-group',
            version: 'v2.5.1',
            description: 'Phần mềm tính toán khối lượng đất đắp, đào tự động từ mặt cắt ngang. Hỗ trợ đa dạng loại mặt cắt và xuất bảng Excel.',
            features: [
                'Tính khối lượng đất đắp, đào tự động',
                'Hỗ trợ nhiều loại mặt cắt ngang',
                'Xuất kết quả ra Excel với định dạng đẹp',
                'Tích hợp công thức tính toán chính xác',
                'Hỗ trợ undo/redo',
                'Tùy chỉnh layer và màu sắc'
            ],
            requirements: [
                'AutoCAD 2010 trở lên',
                'Windows 7/8/10/11',
                'Visual LISP Runtime'
            ],
            changelog: [
                { version: 'v2.5.1', date: '10/01/2026', changes: ['Sửa lỗi tính toán với mặt cắt đặc biệt', 'Cải thiện hiệu suất'] },
                { version: 'v2.5.0', date: '05/12/2025', changes: ['Thêm tính năng xuất Excel nâng cao', 'Hỗ trợ thêm loại mặt cắt mới'] },
                { version: 'v2.4.0', date: '20/10/2025', changes: ['Cập nhật giao diện', 'Tối ưu thuật toán tính toán'] }
            ]
        },
        'cd': {
            title: 'CD - Cắt Chân Dim',
            icon: 'fa-ruler',
            version: 'v1.8.0',
            description: 'Cắt chân dimension theo tiêu chuẩn thiết kế. Tự động điều chỉnh vị trí và format text.',
            features: [
                'Cắt dimension theo tiêu chuẩn',
                'Auto format text dimension',
                'Hỗ trợ nhiều layer',
                'Batch processing',
                'Tùy chỉnh độ dài cắt',
                'Preview trước khi áp dụng'
            ],
            requirements: [
                'AutoCAD 2010 trở lên',
                'Windows 7/8/10/11'
            ],
            changelog: [
                { version: 'v1.8.0', date: '05/12/2025', changes: ['Thêm chức năng preview', 'Cải thiện độ chính xác'] },
                { version: 'v1.7.5', date: '15/09/2025', changes: ['Sửa lỗi với dimension xoay', 'Tối ưu hiệu suất'] }
            ]
        },
        'ntext': {
            title: 'NTEXT - Nối Text',
            icon: 'fa-font',
            version: 'v1.3.2',
            description: 'Nối text nhanh chóng với nhiều tùy chọn. Hỗ trợ format và sắp xếp tự động.',
            features: [
                'Nối text nhanh chóng',
                'Nhiều tùy chọn nối',
                'Auto format text',
                'Undo/redo support',
                'Giữ nguyên style gốc',
                'Tùy chỉnh ký tự phân cách'
            ],
            requirements: [
                'AutoCAD 2010 trở lên',
                'Windows 7/8/10/11'
            ],
            changelog: [
                { version: 'v1.3.2', date: '20/11/2025', changes: ['Sửa lỗi với text đặc biệt', 'Cải thiện UI'] },
                { version: 'v1.3.0', date: '01/10/2025', changes: ['Thêm tùy chọn format mới', 'Tối ưu thuật toán'] }
            ]
        }
    };
    
    const software = softwareDetails[softwareId];
    if (!software) return;
    
    modalBody.innerHTML = `
        <div class="software-detail">
            <div class="detail-header">
                <div class="software-icon" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                    <i class="fas ${software.icon}"></i>
                </div>
                <div>
                    <h2>${software.title}</h2>
                    <span class="version-badge">${software.version}</span>
                </div>
            </div>
            
            <div class="detail-section">
                <h3>Mô tả</h3>
                <p>${software.description}</p>
            </div>
            
            <div class="detail-section">
                <h3>Tính năng</h3>
                <ul class="feature-list">
                    ${software.features.map(f => `<li><i class="fas fa-check"></i> ${f}</li>`).join('')}
                </ul>
            </div>
            
            <div class="detail-section">
                <h3>Yêu cầu hệ thống</h3>
                <ul class="requirement-list">
                    ${software.requirements.map(r => `<li><i class="fas fa-desktop"></i> ${r}</li>`).join('')}
                </ul>
            </div>
            
            <div class="detail-section">
                <h3>Lịch sử cập nhật</h3>
                <div class="changelog">
                    ${software.changelog.map(log => `
                        <div class="changelog-item">
                            <div class="changelog-header">
                                <span class="version-badge">${log.version}</span>
                                <span class="changelog-date">${log.date}</span>
                            </div>
                            <ul>
                                ${log.changes.map(c => `<li>${c}</li>`).join('')}
                            </ul>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div class="detail-actions">
                <button class="btn btn-primary btn-block" onclick="downloadSoftware('${softwareId}')">
                    <i class="fas fa-download"></i> Tải xuống ${software.version}
                </button>
            </div>
        </div>
    `;
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
};

// Add to initialization
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initNavigation();
    initToolsFilter();
    initSoftwareTabs();
    loadUtilities();
    
    // Rest of initialization code...
});

// ==================== MYSTICAL FUNCTIONS ====================
const getMysticalContent = (mysticalId) => {
    const contents = {
        'tu-vi': `
            <div class="tool-content">
                <h2 class="tool-content-title"><i class="fas fa-yin-yang"></i> Lá Số Tử Vi</h2>
                <p class="tool-content-desc">Xem lá số tử vi chi tiết với 12 cung</p>
                
                <div class="date-input-group">
                    <div class="input-container">
                        <label>Ngày sinh:</label>
                        <input type="number" id="tv-day" placeholder="Ngày" min="1" max="31" class="input-field">
                    </div>
                    <div class="input-container">
                        <label>Tháng:</label>
                        <input type="number" id="tv-month" placeholder="Tháng" min="1" max="12" class="input-field">
                    </div>
                    <div class="input-container">
                        <label>Năm:</label>
                        <input type="number" id="tv-year" placeholder="Năm" min="1900" max="2100" class="input-field">
                    </div>
                </div>
                
                <div class="input-container">
                    <label>Giới tính:</label>
                    <select id="tv-gender" class="input-field">
                        <option value="1">Nam</option>
                        <option value="0">Nữ</option>
                    </select>
                </div>
                
                <button onclick="calculateTuVi()" class="btn btn-primary btn-block">
                    <i class="fas fa-calculator"></i> Lập lá số
                </button>
                
                <div id="tuvi-result" class="result-container" style="display: none;">
                    <div class="mystical-result-grid">
                        <div class="result-card">
                            <h3>Bát Tự</h3>
                            <p id="tuvi-canchi">---</p>
                        </div>
                        <div class="result-card">
                            <h3>Mệnh</h3>
                            <p id="tuvi-menh">---</p>
                        </div>
                        <div class="result-card">
                            <h3>Cung Phi Tinh</h3>
                            <p id="tuvi-cung">---</p>
                        </div>
                        <div class="result-card">
                            <h3>Hướng Tốt</h3>
                            <p id="tuvi-huong">---</p>
                        </div>
                        <div class="result-card">
                            <h3>Màu Hợp</h3>
                            <p id="tuvi-color">---</p>
                        </div>
                        <div class="result-card">
                            <h3>Cung Hoàng Đạo</h3>
                            <p id="tuvi-zodiac">---</p>
                        </div>
                    </div>
                </div>
            </div>
        `,
        
        'numerology': `
            <div class="tool-content">
                <h2 class="tool-content-title"><i class="fas fa-calculator-alt"></i> Thần Số Học</h2>
                <p class="tool-content-desc">Phân tích con số chủ đạo từ tên và ngày sinh</p>
                
                <div class="input-container">
                    <label>Họ và tên đầy đủ:</label>
                    <input type="text" id="num-name" placeholder="Ví dụ: Nguyen Van A" class="input-field">
                </div>
                
                <div class="date-input-group">
                    <div class="input-container">
                        <label>Ngày sinh:</label>
                        <input type="number" id="num-day" placeholder="Ngày" min="1" max="31" class="input-field">
                    </div>
                    <div class="input-container">
                        <label>Tháng:</label>
                        <input type="number" id="num-month" placeholder="Tháng" min="1" max="12" class="input-field">
                    </div>
                    <div class="input-container">
                        <label>Năm:</label>
                        <input type="number" id="num-year" placeholder="Năm" min="1900" max="2100" class="input-field">
                    </div>
                </div>
                
                <button onclick="calculateNumerology()" class="btn btn-primary btn-block">
                    <i class="fas fa-magic"></i> Phân tích số
                </button>
                
                <div id="numerology-result" class="result-container" style="display: none;">
                    <div class="mystical-result-grid">
                        <div class="result-card highlight">
                            <h3>Số Chủ Đạo</h3>
                            <p class="big-number" id="num-life-path">-</p>
                        </div>
                        <div class="result-card">
                            <h3>Động Lực Bên Trong</h3>
                            <p id="num-soul">-</p>
                        </div>
                        <div class="result-card">
                            <h3>Năng Lực Tự Nhiên</h3>
                            <p id="num-expression">-</p>
                        </div>
                        <div class="result-card">
                            <h3>Nhân Cách Bên Ngoài</h3>
                            <p id="num-personality">-</p>
                        </div>
                    </div>
                    <div class="interpretation" id="num-interpretation">
                        <h4>Giải nghĩa:</h4>
                        <p id="num-meaning">---</p>
                    </div>
                </div>
            </div>
        `,
        
        'lunar-calendar': `
            <div class="tool-content">
                <h2 class="tool-content-title"><i class="fas fa-calendar-alt"></i> Lịch Vạn Niên</h2>
                <p class="tool-content-desc">Tra cứu âm dương lịch và ngày tốt xấu</p>
                
                <div class="date-input-group">
                    <div class="input-container">
                        <label>Chọn ngày:</label>
                        <input type="date" id="lunar-date-input" class="input-field">
                    </div>
                </div>
                
                <button onclick="convertLunarDate()" class="btn btn-primary btn-block">
                    <i class="fas fa-sync"></i> Chuyển đổi
                </button>
                
                <div id="lunar-result" class="result-container" style="display: none;">
                    <div class="calendar-display">
                        <div class="calendar-solar">
                            <h3>Dương Lịch</h3>
                            <p class="date-display" id="lunar-solar-date">--/--/----</p>
                        </div>
                        <div class="calendar-lunar">
                            <h3>Âm Lịch</h3>
                            <p class="date-display" id="lunar-converted-date">--/--/----</p>
                        </div>
                    </div>
                    <div class="mystical-result-grid">
                        <div class="result-card">
                            <h3>Can Chi</h3>
                            <p id="lunar-canchi">---</p>
                        </div>
                        <div class="result-card">
                            <h3>Sao Tốt</h3>
                            <p id="lunar-good-stars">---</p>
                        </div>
                        <div class="result-card">
                            <h3>Sao Xấu</h3>
                            <p id="lunar-bad-stars">---</p>
                        </div>
                        <div class="result-card">
                            <h3>Ngày Hoàng Đạo</h3>
                            <p id="lunar-auspicious">---</p>
                        </div>
                    </div>
                </div>
            </div>
        `,
        
        'construction-age': `
            <div class="tool-content">
                <h2 class="tool-content-title"><i class="fas fa-home"></i> Tuổi Xây Dựng</h2>
                <p class="tool-content-desc">Xem tuổi xây nhà và hướng nhà hợp phong thủy</p>
                
                <div class="input-container">
                    <label>Tuổi chủ nhà:</label>
                    <input type="number" id="construction-age" placeholder="Năm sinh (VD: 1990)" min="1900" max="2100" class="input-field">
                </div>
                
                <div class="input-container">
                    <label>Giới tính chủ nhà:</label>
                    <select id="construction-gender" class="input-field">
                        <option value="1">Nam</option>
                        <option value="0">Nữ</option>
                    </select>
                </div>
                
                <button onclick="calculateConstruction()" class="btn btn-primary btn-block">
                    <i class="fas fa-compass"></i> Xem tuổi xây
                </button>
                
                <div id="construction-result" class="result-container" style="display: none;">
                    <div class="mystical-result-grid">
                        <div class="result-card highlight">
                            <h3>Mệnh</h3>
                            <p id="construction-menh">---</p>
                        </div>
                        <div class="result-card">
                            <h3>Hướng Nhà Tốt</h3>
                            <p id="construction-direction">---</p>
                        </div>
                        <div class="result-card">
                            <h3>Màu Sơn Hợp</h3>
                            <p id="construction-color">---</p>
                        </div>
                        <div class="result-card">
                            <h3>Năm Nên Xây</h3>
                            <p id="construction-years">---</p>
                        </div>
                    </div>
                    <div class="interpretation">
                        <h4>Lưu ý:</h4>
                        <p id="construction-note">Nên chọn ngày giờ tốt khi khởi công xây dựng.</p>
                    </div>
                </div>
            </div>
        `
    };
    
    return contents[mysticalId] || '<p>Tính năng đang được phát triển...</p>';
};

const initMysticalFunctionality = (mysticalId) => {
    if (mysticalId === 'lunar-calendar') {
        // Set today as default
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('lunar-date-input').value = today;
    }
};

// Tử Vi Calculation
const calculateTuVi = () => {
    const day = parseInt(document.getElementById('tv-day').value);
    const month = parseInt(document.getElementById('tv-month').value);
    const year = parseInt(document.getElementById('tv-year').value);
    const gender = parseInt(document.getElementById('tv-gender').value);
    
    if (!day || !month || !year) {
        showToast('✗ Vui lòng nhập đầy đủ ngày sinh');
        return;
    }
    
    try {
        if (typeof Lunar !== 'undefined') {
            const solar = Solar.fromYmd(year, month, day);
            const lunar = solar.getLunar();
            
            // Bát Tự
            const canchi = `${lunar.getYearInGanZhi()} ${lunar.getMonthInGanZhi()} ${lunar.getDayInGanZhi()}`;
            document.getElementById('tuvi-canchi').textContent = canchi;
            
            // Mệnh
            const menh = getNguHanh(lunar.getYearInGanZhi());
            document.getElementById('tuvi-menh').textContent = menh;
            
            // Cung Phi Tinh
            const cung = getCungPhiTinh(gender, lunar.getYear());
            document.getElementById('tuvi-cung').textContent = cung;
            
            // Hướng Tốt
            const huong = getHuongTot(menh);
            document.getElementById('tuvi-huong').textContent = huong;
            
            // Màu Hợp
            const color = getMauHop(menh);
            document.getElementById('tuvi-color').textContent = color;
            
            // Cung Hoàng Đạo
            const zodiac = getZodiac(month, day);
            document.getElementById('tuvi-zodiac').textContent = zodiac;
            
            document.getElementById('tuvi-result').style.display = 'block';
            showToast('✓ Đã lập lá số tử vi');
        } else {
            throw new Error('Lunar library not loaded');
        }
    } catch (err) {
        showToast('✗ Lỗi khi tính toán');
        console.error(err);
    }
};

// Helper functions for Tử Vi
const getNguHanh = (canchi) => {
    const menhMap = {
        'Giáp Tý': 'Hải Trung Kim', 'Ất Sửu': 'Hải Trung Kim',
        'Bính Dần': 'Lư Trung Hỏa', 'Đinh Mão': 'Lư Trung Hỏa',
        'Mậu Thìn': 'Đại Lâm Mộc', 'Kỷ Tỵ': 'Đại Lâm Mộc',
        'Canh Ngọ': 'Lộ Bàng Thổ', 'Tân Mùi': 'Lộ Bàng Thổ',
        'Nhâm Thân': 'Kiếm Phong Kim', 'Quý Dậu': 'Kiếm Phong Kim',
        'Giáp Tuất': 'Sơn Đầu Hỏa', 'Ất Hợi': 'Sơn Đầu Hỏa'
    };
    return menhMap[canchi] || 'Chưa xác định';
};

const getCungPhiTinh = (gender, year) => {
    const cungList = ['Khôn', 'Đoài', 'Càn', 'Khảm', 'Ly', 'Cấn', 'Chấn', 'Tốn'];
    const index = (year % 9) + (gender === 1 ? 0 : 1);
    return cungList[index % cungList.length];
};

const getHuongTot = (menh) => {
    const huongMap = {
        'Kim': 'Tây, Tây Bắc',
        'Mộc': 'Đông, Đông Nam',
        'Thủy': 'Bắc',
        'Hỏa': 'Nam',
        'Thổ': 'Trung tâm, Tây Nam, Đông Bắc'
    };
    
    for (const [key, value] of Object.entries(huongMap)) {
        if (menh.includes(key)) return value;
    }
    return 'Đông Nam';
};

const getMauHop = (menh) => {
    const colorMap = {
        'Kim': 'Trắng, Vàng kim',
        'Mộc': 'Xanh lá, Xanh lam',
        'Thủy': 'Đen, Xanh đen',
        'Hỏa': 'Đỏ, Cam, Hồng',
        'Thổ': 'Vàng, Nâu'
    };
    
    for (const [key, value] of Object.entries(colorMap)) {
        if (menh.includes(key)) return value;
    }
    return 'Trắng';
};

const getZodiac = (month, day) => {
    const zodiacData = [
        { name: 'Ma Kết', start: [12, 22], end: [1, 19] },
        { name: 'Bảo Bình', start: [1, 20], end: [2, 18] },
        { name: 'Song Ngư', start: [2, 19], end: [3, 20] },
        { name: 'Bạch Dương', start: [3, 21], end: [4, 19] },
        { name: 'Kim Ngưu', start: [4, 20], end: [5, 20] },
        { name: 'Song Tử', start: [5, 21], end: [6, 20] },
        { name: 'Cự Giải', start: [6, 21], end: [7, 22] },
        { name: 'Sư Tử', start: [7, 23], end: [8, 22] },
        { name: 'Xử Nữ', start: [8, 23], end: [9, 22] },
        { name: 'Thiên Bình', start: [9, 23], end: [10, 22] },
        { name: 'Bọ Cạp', start: [10, 23], end: [11, 21] },
        { name: 'Nhân Mã', start: [11, 22], end: [12, 21] }
    ];
    
    for (const zodiac of zodiacData) {
        const [startMonth, startDay] = zodiac.start;
        const [endMonth, endDay] = zodiac.end;
        
        if ((month === startMonth && day >= startDay) || 
            (month === endMonth && day <= endDay)) {
            return zodiac.name;
        }
    }
    
    return 'Ma Kết';
};

// Numerology Calculation
const PYTHAGOREAN = {
    'a': 1, 'j': 1, 's': 1,
    'b': 2, 'k': 2, 't': 2,
    'c': 3, 'l': 3, 'u': 3,
    'd': 4, 'm': 4, 'v': 4,
    'e': 5, 'n': 5, 'w': 5,
    'f': 6, 'o': 6, 'x': 6,
    'g': 7, 'p': 7, 'y': 7,
    'h': 8, 'q': 8, 'z': 8,
    'i': 9, 'r': 9
};

const removeVietnameseAccent = (str) => {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D');
};

const reduceToSingleDigit = (num) => {
    while (num > 9 && ![11, 22, 33].includes(num)) {
        num = num.toString().split('').reduce((a, b) => parseInt(a) + parseInt(b), 0);
    }
    return num;
};

const calculateNumerology = () => {
    const name = document.getElementById('num-name').value.trim();
    const day = parseInt(document.getElementById('num-day').value);
    const month = parseInt(document.getElementById('num-month').value);
    const year = parseInt(document.getElementById('num-year').value);
    
    if (!name || !day || !month || !year) {
        showToast('✗ Vui lòng nhập đầy đủ thông tin');
        return;
    }
    
    // Life Path Number
    const lifePath = reduceToSingleDigit(day + month + year);
    document.getElementById('num-life-path').textContent = lifePath;
    
    // Process name
    const cleanName = removeVietnameseAccent(name).toLowerCase().replace(/[^a-z]/g, '');
    
    // Expression Number (all letters)
    let expressionSum = 0;
    for (let char of cleanName) {
        expressionSum += PYTHAGOREAN[char] || 0;
    }
    const expression = reduceToSingleDigit(expressionSum);
    document.getElementById('num-expression').textContent = expression;
    
    // Soul Number (vowels)
    const vowels = 'aeiou';
    let soulSum = 0;
    for (let char of cleanName) {
        if (vowels.includes(char)) {
            soulSum += PYTHAGOREAN[char] || 0;
        }
    }
    const soul = reduceToSingleDigit(soulSum);
    document.getElementById('num-soul').textContent = soul;
    
    // Personality Number (consonants)
    let personalitySum = 0;
    for (let char of cleanName) {
        if (!vowels.includes(char)) {
            personalitySum += PYTHAGOREAN[char] || 0;
        }
    }
    const personality = reduceToSingleDigit(personalitySum);
    document.getElementById('num-personality').textContent = personality;
    
    // Interpretation
    const meanings = {
        1: 'Người tiên phong, lãnh đạo, độc lập',
        2: 'Người hòa giải, nhạy cảm, hợp tác',
        3: 'Người sáng tạo, giao tiếp, biểu đạt',
        4: 'Người thực tế, ổn định, làm việc chăm chỉ',
        5: 'Người tự do, phiêu lưu, thích thay đổi',
        6: 'Người có trách nhiệm, chăm sóc gia đình',
        7: 'Người trí tuệ, suy tư, tâm linh',
        8: 'Người quyền lực, thành công vật chất',
        9: 'Người nhân đạo, rộng lượng, vị tha',
        11: 'Người trực giác mạnh, tầm nhìn xa',
        22: 'Người xây dựng, thành tựu lớn',
        33: 'Người thầy vĩ đại, yêu thương cao cả'
    };
    
    document.getElementById('num-meaning').textContent = meanings[lifePath] || 'Số đặc biệt, cần nghiên cứu sâu hơn';
    document.getElementById('numerology-result').style.display = 'block';
    showToast('✓ Đã phân tích thần số học');
};

// Lunar Calendar Conversion
const convertLunarDate = () => {
    const dateInput = document.getElementById('lunar-date-input').value;
    
    if (!dateInput) {
        showToast('✗ Vui lòng chọn ngày');
        return;
    }
    
    try {
        if (typeof Solar !== 'undefined') {
            const [year, month, day] = dateInput.split('-').map(Number);
            const solar = Solar.fromYmd(year, month, day);
            const lunar = solar.getLunar();
            
            document.getElementById('lunar-solar-date').textContent = 
                `${day}/${month}/${year}`;
            document.getElementById('lunar-converted-date').textContent = 
                `${lunar.getDay()}/${lunar.getMonth()}/${lunar.getYear()}`;
            document.getElementById('lunar-canchi').textContent = 
                lunar.getYearInGanZhi();
            document.getElementById('lunar-good-stars').textContent = 
                'Thiên Đức, Nguyệt Đức';
            document.getElementById('lunar-bad-stars').textContent = 
                'Tam Sát, Ngũ Quỷ';
            document.getElementById('lunar-auspicious').textContent = 
                lunar.getDayInGanZhi().includes('Tý') ? 'Có' : 'Không';
            
            document.getElementById('lunar-result').style.display = 'block';
            showToast('✓ Đã chuyển đổi lịch');
        }
    } catch (err) {
        showToast('✗ Lỗi khi chuyển đổi');
        console.error(err);
    }
};

// Construction Age Calculation
const calculateConstruction = () => {
    const birthYear = parseInt(document.getElementById('construction-age').value);
    const gender = parseInt(document.getElementById('construction-gender').value);
    
    if (!birthYear) {
        showToast('✗ Vui lòng nhập năm sinh');
        return;
    }
    
    try {
        if (typeof Lunar !== 'undefined') {
            const lunar = Lunar.fromYmd(birthYear, 1, 1);
            const canchi = lunar.getYearInGanZhi();
            const menh = getNguHanh(canchi);
            
            document.getElementById('construction-menh').textContent = menh;
            document.getElementById('construction-direction').textContent = getHuongTot(menh);
            document.getElementById('construction-color').textContent = getMauHop(menh);
            
            const currentYear = new Date().getFullYear();
            const goodYears = [];
            for (let i = 0; i < 5; i++) {
                const year = currentYear + i;
                if ((year - birthYear) % 9 !== 0) {
                    goodYears.push(year);
                }
            }
            document.getElementById('construction-years').textContent = goodYears.slice(0, 3).join(', ');
            
            document.getElementById('construction-result').style.display = 'block';
            showToast('✓ Đã tính tuổi xây dựng');
        }
    } catch (err) {
        showToast('✗ Lỗi khi tính toán');
        console.error(err);
    }
};
