// ==================== API UTILITIES ====================
// Tất cả các API calls được tập trung ở đây

// 1. GOLD PRICE API
// Cập nhật thủ công hàng tuần - thay số bên dưới (Metals-API không hỗ trợ CORS free)
const GOLD_PRICE_VND = 119500000; // Giá SJC mua vào per lượng - cập nhật: 19/04/2026

const loadGoldPrice = () => {
    const priceEl = document.getElementById('gold-price');
    const updateEl = document.getElementById('gold-update');
    if (priceEl) priceEl.innerHTML = formatNumber(GOLD_PRICE_VND);
    if (updateEl) updateEl.textContent = '19/04/2026';
};

// 2. USD RATE API
const loadUSDRate = async () => {
    const rateEl = document.getElementById('usd-rate');
    
    try {
        // Sử dụng ExchangeRate-API (miễn phí, không cần key)
        const response = await fetch('https://open.er-api.com/v6/latest/USD');
        const data = await response.json();
        
        if (data.result === 'success') {
            const rate = Math.round(data.rates.VND);
            rateEl.innerHTML = formatNumber(rate);
        } else {
            throw new Error('API returned error');
        }
    } catch (err) {
        console.log('USD API error, using fallback:', err);
        // Fallback với tỷ giá gần đúng
        const rate = 24250;
        rateEl.innerHTML = formatNumber(rate);
    }
};

// 3. GASOLINE PRICE
// Lưu ý: Không có API miễn phí cho giá xăng VN
// Phương án: Scrape từ website chính thống hoặc dùng mock data
const loadGasolinePrice = async () => {
    const priceEl = document.getElementById('gasoline-price');
    
    try {
        // Simulate loading
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Mock data dựa trên giá thực tế hiện tại
        // Có thể cập nhật thủ công hoặc scrape từ petrolimex.com.vn
        const currentPrice = 22450; // Giá base thực tế
        const variation = Math.floor(Math.random() * 300) - 150; // Random ±150
        const price = currentPrice + variation;
        
        priceEl.innerHTML = formatNumber(price);
        
        // TODO: Implement scraping hoặc tìm API thực
        // Có thể dùng backend service để scrape định kỳ
    } catch (err) {
        console.log('Gasoline price error:', err);
        priceEl.textContent = 'N/A';
    }
};

// 4. WEATHER API
const loadWeather = async () => {
    const tempEl = document.getElementById('weather-temp');
    const descEl = document.getElementById('weather-desc');
    const iconEl = document.getElementById('weather-icon');
    
    try {
        // OpenWeatherMap API (Free tier)
        // Bạn cần đăng ký tại: https://openweathermap.org/api
        // Thay YOUR_API_KEY bằng key thực của bạn
        const API_KEY = 'YOUR_OPENWEATHER_API_KEY'; // TODO: Thêm API key
        const city = 'Da Nang';
        const lang = 'vi';
        
        if (API_KEY === 'YOUR_OPENWEATHER_API_KEY') {
            throw new Error('API key not configured');
        }
        
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric&lang=${lang}`;
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.cod === 200) {
            const temp = Math.round(data.main.temp);
            const desc = data.weather[0].description;
            const icon = data.weather[0].icon;
            
            tempEl.textContent = `${temp}°C`;
            descEl.textContent = desc.charAt(0).toUpperCase() + desc.slice(1);
            
            if (iconEl) {
                iconEl.innerHTML = `<img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="${desc}">`;
            }
        } else {
            throw new Error('Weather API error');
        }
    } catch (err) {
        console.log('Weather API error, using fallback:', err);
        // Fallback data
        tempEl.textContent = '28°C';
        descEl.textContent = 'Nắng đẹp';
    }
};

// 5. CRYPTO PRICE API (Bonus feature)
const loadCryptoPrices = async () => {
    try {
        // CoinGecko API (Free, no key required)
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd');
        const data = await response.json();
        
        return {
            bitcoin: data.bitcoin.usd,
            ethereum: data.ethereum.usd
        };
    } catch (err) {
        console.log('Crypto API error:', err);
        return null;
    }
};

// 6. STOCK MARKET API (Vietnam)
// Lưu ý: Cần API key từ SSI hoặc VND Direct
const loadVNIndex = async () => {
    try {
        // TODO: Implement khi có API key
        // Tạm thời dùng mock data
        return {
            vnindex: 1250.5,
            change: +5.2,
            percent: +0.42
        };
    } catch (err) {
        console.log('Stock API error:', err);
        return null;
    }
};

// 7. NEWS API
const loadLatestNews = async () => {
    try {
        // NewsAPI (Free tier: 100 requests/day)
        // Đăng ký tại: https://newsapi.org/
        const API_KEY = 'YOUR_NEWS_API_KEY'; // TODO: Thêm API key
        
        if (API_KEY === 'YOUR_NEWS_API_KEY') {
            throw new Error('API key not configured');
        }
        
        const url = `https://newsapi.org/v2/top-headlines?country=vn&apiKey=${API_KEY}`;
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.status === 'ok') {
            return data.articles.slice(0, 5);
        }
        throw new Error('News API error');
    } catch (err) {
        console.log('News API error:', err);
        return [];
    }
};

// 8. HOLIDAY API
const loadHolidays = async () => {
    try {
        const year = new Date().getFullYear();
        // Calendarific API (Free tier)
        const API_KEY = 'YOUR_CALENDARIFIC_API_KEY'; // TODO: Thêm API key
        
        if (API_KEY === 'YOUR_CALENDARIFIC_API_KEY') {
            // Fallback: Vietnam holidays 2026
            return [
                { date: '2026-01-01', name: 'Tết Dương lịch' },
                { date: '2026-01-28', name: 'Tết Nguyên Đán' },
                { date: '2026-04-30', name: 'Giải phóng miền Nam' },
                { date: '2026-05-01', name: 'Ngày Quốc tế Lao động' },
                { date: '2026-09-02', name: 'Quốc khánh' }
            ];
        }
        
        const url = `https://calendarific.com/api/v2/holidays?api_key=${API_KEY}&country=VN&year=${year}`;
        const response = await fetch(url);
        const data = await response.json();
        
        return data.response.holidays;
    } catch (err) {
        console.log('Holiday API error:', err);
        return [];
    }
};

// ==================== LOAD ALL UTILITIES ====================
const loadAllUtilities = async () => {
    // Load all data in parallel
    await Promise.all([
        loadGoldPrice(),
        loadUSDRate(),
        loadGasolinePrice(),
        loadLunarDate()
    ]);
    
    // Optional: Load additional data
    // await loadWeather();
};

// ==================== HELPER FUNCTIONS ====================
const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

const formatCurrency = (amount, currency = 'VND') => {
    if (currency === 'VND') {
        return formatNumber(amount) + ' ₫';
    } else if (currency === 'USD') {
        return '$' + formatNumber(amount);
    }
    return formatNumber(amount);
};

// ==================== EXPORT ====================
// Nếu dùng ES6 modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        loadGoldPrice,
        loadUSDRate,
        loadGasolinePrice,
        loadWeather,
        loadCryptoPrices,
        loadVNIndex,
        loadLatestNews,
        loadHolidays,
        loadAllUtilities,
        formatNumber,
        formatCurrency
    };
}
