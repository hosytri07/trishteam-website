// ==================== NEWS FUNCTIONS ====================
const loadNews = async () => {
    const container = document.getElementById('news-container');
    
    // Dùng mock news (NewsAPI không hỗ trợ CORS trên browser free tier)
    {
        const mockNews = [
            {
                title: 'OpenAI ra mắt GPT-5 với khả năng reasoning mạnh mẽ hơn',
                description: 'Mô hình ngôn ngữ mới nhất của OpenAI hứa hẹn đột phá trong xử lý ngôn ngữ tự nhiên',
                image: 'https://via.placeholder.com/400x200/667eea/ffffff?text=OpenAI+GPT-5',
                source: 'TechCrunch',
                date: '2 giờ trước',
                url: '#'
            },
            {
                title: 'Meta công bố Llama 4 - mô hình AI mã nguồn mở mạnh nhất',
                description: 'Llama 4 vượt trội GPT-4 trong nhiều benchmark, miễn phí cho nghiên cứu',
                image: 'https://via.placeholder.com/400x200/764ba2/ffffff?text=Meta+Llama+4',
                source: 'VnExpress',
                date: '5 giờ trước',
                url: '#'
            },
            {
                title: 'Google DeepMind phát triển AI dự đoán thời tiết chính xác 100%',
                description: 'Công nghệ GraphCast mới có thể dự báo thời tiết 10 ngày tới với độ chính xác cao',
                image: 'https://via.placeholder.com/400x200/4facfe/ffffff?text=Google+DeepMind',
                source: 'The Verge',
                date: '1 ngày trước',
                url: '#'
            }
        ];
        
        container.innerHTML = mockNews.map(news => `
            <div class="news-card" onclick="window.open('${news.url}', '_blank')">
                <img src="${news.image}" alt="${news.title}" class="news-image">
                <div class="news-content">
                    <h3 class="news-title">${news.title}</h3>
                    <p class="news-desc">${news.description}</p>
                    <div class="news-meta">
                        <span class="news-source">${news.source}</span>
                        <span class="news-date">${news.date}</span>
                    </div>
                </div>
            </div>
        `).join('');
    }
};

// ==================== CRYPTO FUNCTIONS ====================
const loadCryptoPrice = async () => {
    try {
        // Using CoinGecko API (free, no key required)
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,binancecoin,cardano&vs_currencies=usd&include_24hr_change=true');
        const data = await response.json();
        
        // Bitcoin
        updateCryptoCard('btc', data.bitcoin.usd, data.bitcoin.usd_24h_change);
        
        // Ethereum
        updateCryptoCard('eth', data.ethereum.usd, data.ethereum.usd_24h_change);
        
        // BNB
        updateCryptoCard('bnb', data.binancecoin.usd, data.binancecoin.usd_24h_change);
        
        // Cardano
        updateCryptoCard('ada', data.cardano.usd, data.cardano.usd_24h_change);
        
    } catch (err) {
        console.log('Crypto API error, using fallback:', err);
        // Fallback data
        updateCryptoCard('btc', 95420, 2.5);
        updateCryptoCard('eth', 3650, 1.8);
        updateCryptoCard('bnb', 615, -0.5);
        updateCryptoCard('ada', 1.25, 3.2);
    }
};

const updateCryptoCard = (coin, price, change) => {
    const priceEl = document.getElementById(`${coin}-price`);
    const changeEl = document.getElementById(`${coin}-change`);
    
    if (priceEl && changeEl) {
        priceEl.textContent = '$' + formatNumber(price.toFixed(2));
        
        const isPositive = change >= 0;
        changeEl.textContent = (isPositive ? '+' : '') + change.toFixed(2) + '%';
        changeEl.className = 'crypto-change ' + (isPositive ? 'positive' : 'negative');
    }
};

// ==================== CALCULATOR FUNCTIONS ====================

// Initialize calculator tabs
const initCalculatorTabs = () => {
    const tabs = document.querySelectorAll('.calc-tab');
    const contents = document.querySelectorAll('.calc-content');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const target = tab.dataset.calc;
            
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            contents.forEach(content => {
                if (content.id === target) {
                    content.classList.add('active');
                } else {
                    content.classList.remove('active');
                }
            });
        });
    });
};

// Loan Calculator
const calculateLoan = () => {
    const amount = parseFloat(document.getElementById('loan-amount').value);
    const rate = parseFloat(document.getElementById('loan-rate').value) / 100 / 12; // monthly rate
    const months = parseInt(document.getElementById('loan-months').value);
    
    if (!amount || !rate || !months) {
        showToast('✗ Vui lòng nhập đầy đủ thông tin');
        return;
    }
    
    // Calculate monthly payment using formula: P * [r(1+r)^n] / [(1+r)^n - 1]
    const monthlyPayment = amount * (rate * Math.pow(1 + rate, months)) / (Math.pow(1 + rate, months) - 1);
    const totalPayment = monthlyPayment * months;
    const totalInterest = totalPayment - amount;
    
    document.getElementById('loan-monthly').textContent = formatNumber(Math.round(monthlyPayment)) + ' ₫';
    document.getElementById('loan-interest').textContent = formatNumber(Math.round(totalInterest)) + ' ₫';
    document.getElementById('loan-total').textContent = formatNumber(Math.round(totalPayment)) + ' ₫';
    
    document.getElementById('loan-result').style.display = 'block';
    showToast('✓ Đã tính toán xong');

    // Vẽ Pie Chart vốn vs lãi
    const loanCtx = document.getElementById('loan-chart');
    if (loanCtx) {
        if (window._loanChart) window._loanChart.destroy();
        window._loanChart = new Chart(loanCtx, {
            type: 'doughnut',
            data: {
                labels: ['Vốn gốc', 'Tiền lãi'],
                datasets: [{
                    data: [Math.round(amount), Math.round(totalInterest)],
                    backgroundColor: ['#667eea', '#764ba2'],
                    borderWidth: 0,
                    hoverOffset: 6
                }]
            },
            options: {
                responsive: true,
                cutout: '68%',
                plugins: {
                    legend: { position: 'bottom', labels: { color: '#a09890', font: { size: 12 }, padding: 16 } },
                    tooltip: {
                        callbacks: { label: ctx => ' ' + formatNumber(ctx.raw) + ' ₫' }
                    }
                }
            }
        });
    }
};

// Investment Calculator
const calculateInvestment = () => {
    const principal = parseFloat(document.getElementById('invest-principal').value);
    const returnRate = parseFloat(document.getElementById('invest-return').value) / 100;
    const years = parseInt(document.getElementById('invest-years').value);
    const monthlyContribution = parseFloat(document.getElementById('invest-monthly').value);
    
    if (!principal || !returnRate || !years) {
        showToast('✗ Vui lòng nhập đầy đủ thông tin');
        return;
    }
    
    const months = years * 12;
    const monthlyRate = returnRate / 12;
    
    // Future value of initial investment
    let futureValue = principal * Math.pow(1 + monthlyRate, months);
    
    // Future value of monthly contributions
    if (monthlyContribution > 0) {
        futureValue += monthlyContribution * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);
    }
    
    const totalInvested = principal + (monthlyContribution * months);
    const profit = futureValue - totalInvested;
    
    document.getElementById('invest-final').textContent = formatNumber(Math.round(futureValue)) + ' ₫';
    document.getElementById('invest-total').textContent = formatNumber(Math.round(totalInvested)) + ' ₫';
    document.getElementById('invest-profit').textContent = formatNumber(Math.round(profit)) + ' ₫';
    
    document.getElementById('invest-result').style.display = 'block';
    showToast('✓ Đã tính toán xong');

    // Vẽ Pie Chart vốn vs lợi nhuận
    const investCtx = document.getElementById('invest-chart');
    if (investCtx) {
        if (window._investChart) window._investChart.destroy();
        window._investChart = new Chart(investCtx, {
            type: 'doughnut',
            data: {
                labels: ['Vốn đầu tư', 'Lợi nhuận'],
                datasets: [{
                    data: [Math.round(totalInvested), Math.round(profit)],
                    backgroundColor: ['#667eea', '#10b981'],
                    borderWidth: 0,
                    hoverOffset: 6
                }]
            },
            options: {
                responsive: true,
                cutout: '68%',
                plugins: {
                    legend: { position: 'bottom', labels: { color: '#a09890', font: { size: 12 }, padding: 16 } },
                    tooltip: {
                        callbacks: { label: ctx => ' ' + formatNumber(ctx.raw) + ' ₫' }
                    }
                }
            }
        });
    }
};

// Mortgage Calculator
const calculateMortgage = () => {
    const homePrice = parseFloat(document.getElementById('home-price').value);
    const downPaymentPercent = parseFloat(document.getElementById('down-payment').value) / 100;
    const rate = parseFloat(document.getElementById('mortgage-rate').value) / 100 / 12;
    const years = parseInt(document.getElementById('mortgage-years').value);
    
    if (!homePrice || !rate || !years) {
        showToast('✗ Vui lòng nhập đầy đủ thông tin');
        return;
    }
    
    const downPayment = homePrice * downPaymentPercent;
    const loanAmount = homePrice - downPayment;
    const months = years * 12;
    
    const monthlyPayment = loanAmount * (rate * Math.pow(1 + rate, months)) / (Math.pow(1 + rate, months) - 1);
    const totalPayment = monthlyPayment * months;
    const totalInterest = totalPayment - loanAmount;
    
    document.getElementById('mortgage-monthly').textContent = formatNumber(Math.round(monthlyPayment)) + ' ₫';
    document.getElementById('mortgage-down').textContent = formatNumber(Math.round(downPayment)) + ' ₫';
    document.getElementById('mortgage-interest').textContent = formatNumber(Math.round(totalInterest)) + ' ₫';
    
    document.getElementById('mortgage-result').style.display = 'block';
    showToast('✓ Đã tính toán xong');
};

// Savings Calculator
const calculateSavings = () => {
    const goal = parseFloat(document.getElementById('savings-goal').value);
    const rate = parseFloat(document.getElementById('savings-rate').value) / 100 / 12;
    const months = parseInt(document.getElementById('savings-months').value);
    
    if (!goal || !rate || !months) {
        showToast('✗ Vui lòng nhập đầy đủ thông tin');
        return;
    }
    
    // Calculate monthly savings needed
    // FV = PMT * [(1+r)^n - 1] / r
    const monthlyPayment = goal / (((Math.pow(1 + rate, months) - 1) / rate));
    const totalSaved = monthlyPayment * months;
    const interestEarned = goal - totalSaved;
    
    document.getElementById('savings-monthly').textContent = formatNumber(Math.round(monthlyPayment)) + ' ₫';
    document.getElementById('savings-total').textContent = formatNumber(Math.round(totalSaved)) + ' ₫';
    document.getElementById('savings-interest').textContent = formatNumber(Math.round(interestEarned)) + ' ₫';
    
    document.getElementById('savings-result').style.display = 'block';
    showToast('✓ Đã tính toán xong');
};

// ==================== WEATHER FUNCTIONS ====================
const loadWeatherDetails = async () => {
    // This is more detailed than the utility card
    const API_KEY = 'YOUR_OPENWEATHER_API_KEY'; // TODO: Add your key
    
    if (API_KEY === 'YOUR_OPENWEATHER_API_KEY') {
        console.log('Weather API key not configured, using fallback');
        // Fallback data
        document.getElementById('weather-main-temp').textContent = '28°C';
        document.getElementById('weather-main-desc').textContent = 'Nắng đẹp';
        document.getElementById('weather-humidity').textContent = '65%';
        document.getElementById('weather-wind').textContent = '15 km/h';
        document.getElementById('weather-pressure').textContent = '1013 hPa';
        return;
    }
    
    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=Da Nang&appid=${API_KEY}&units=metric&lang=vi`
        );
        const data = await response.json();
        
        document.getElementById('weather-main-temp').textContent = Math.round(data.main.temp) + '°C';
        document.getElementById('weather-main-desc').textContent = data.weather[0].description;
        document.getElementById('weather-humidity').textContent = data.main.humidity + '%';
        document.getElementById('weather-wind').textContent = data.wind.speed + ' km/h';
        document.getElementById('weather-pressure').textContent = data.main.pressure + ' hPa';
        
        const iconEl = document.getElementById('weather-icon');
        iconEl.innerHTML = `<img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" alt="${data.weather[0].description}">`;
    } catch (err) {
        console.log('Weather details error:', err);
    }
};

// ==================== INIT ALL ====================
document.addEventListener('DOMContentLoaded', () => {
    // Load news and crypto if elements exist
    if (document.getElementById('news-container')) {
        loadNews();
    }
    
    if (document.getElementById('btc-price')) {
        loadCryptoPrice();
        // Refresh crypto prices every 60 seconds
        setInterval(loadCryptoPrice, 60000);
    }
    
    if (document.querySelector('.calc-tab')) {
        initCalculatorTabs();
    }
    
    if (document.getElementById('weather-main-temp')) {
        loadWeatherDetails();
    }
});
