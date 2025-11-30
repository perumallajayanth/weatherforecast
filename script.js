const API_KEY = "0a1649ceb484f0ec94c9bab944075be4";
const BASE_URL = "https://api.openweathermap.org/data/2.5";

const cityInput = document.getElementById('city-input');
const searchForm = document.getElementById('search-form');
const themeToggle = document.getElementById('theme-toggle');
const statusMessage = document.getElementById('status-message');
const loadingIndicator = document.getElementById('loading');
const weatherCard = document.getElementById('weather-card');
const cityNameEl = document.getElementById('city-name');
const dateTimeEl = document.getElementById('date-time');

const tempEl = document.getElementById('temp');
const descriptionEl = document.getElementById('description');
const humidityEl = document.getElementById('humidity');
const windSpeedEl = document.getElementById('wind-speed');
// Removed forecast elements

// Check for saved theme preference
const savedTheme = localStorage.getItem('theme') || 'light';
document.documentElement.setAttribute('data-theme', savedTheme);
themeToggle.textContent = savedTheme === 'light' ? '🌙' : '☀️';

// Check for saved city
const savedCity = localStorage.getItem('lastCity');
if (savedCity) {
    getWeatherByCity(savedCity);
} else {
    statusMessage.textContent = "Enter a city name to get weather information";
    statusMessage.className = "success";
}

// Event listeners
searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const city = cityInput.value.trim();
    if (city) {
        getWeatherByCity(city);
    }
});

themeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    themeToggle.textContent = newTheme === 'light' ? '🌙' : '☀️';
});

// Weather functions
async function getWeatherByCity(city) {
    showLoading();
    try {
        const response = await fetch(`${BASE_URL}/weather?q=${city}&appid=${API_KEY}&units=metric`);
        if (!response.ok) {
            throw new Error(response.status === 404 ? "City not found" : "Failed to fetch weather data");
        }
        const data = await response.json();
        displayCurrentWeather(data);
        localStorage.setItem('lastCity', city);
        
        // Removed forecast functionality
    } catch (error) {
        showError(error.message);
    } finally {
        hideLoading();
    }
}

function displayCurrentWeather(data) {
    cityNameEl.textContent = `${data.name}, ${data.sys.country}`;
    dateTimeEl.textContent = formatDateTime(data.dt, data.timezone);
    tempEl.textContent = Math.round(data.main.temp);
    descriptionEl.textContent = data.weather[0].description;
    humidityEl.textContent = `${data.main.humidity}%`;
    windSpeedEl.textContent = `${data.wind.speed} m/s`;
    
    statusMessage.textContent = "";
    statusMessage.className = "";
    weatherCard.classList.remove('hidden');
}

// Removed displayForecast function

function formatDateTime(timestamp, timezoneOffset) {
    const date = new Date((timestamp + timezoneOffset - 3600) * 1000);
    return date.toLocaleString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'UTC'
    });
}

function showLoading() {
    loadingIndicator.classList.remove('hidden');
    weatherCard.classList.add('hidden');
    statusMessage.textContent = "";
    statusMessage.className = "";
}

function hideLoading() {
    loadingIndicator.classList.add('hidden');
}

function showError(message) {
    statusMessage.textContent = message;
    statusMessage.className = "error";
    weatherCard.classList.add('hidden');
}