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
const weatherIcon = document.getElementById('weather-icon');
const tempEl = document.getElementById('temp');
const descriptionEl = document.getElementById('description');
const humidityEl = document.getElementById('humidity');
const windSpeedEl = document.getElementById('wind-speed');
const forecastContainer = document.getElementById('forecast-container');
const forecastSection = document.getElementById('forecast');

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
        
        // Get forecast
        try {
            const forecastResponse = await fetch(`${BASE_URL}/forecast?q=${city}&appid=${API_KEY}&units=metric`);
            if (forecastResponse.ok) {
                const forecastData = await forecastResponse.json();
                displayForecast(forecastData);
            }
        } catch (forecastError) {
            console.log("Forecast not available");
            forecastSection.classList.add('hidden');
        }
    } catch (error) {
        showError(error.message);
    } finally {
        hideLoading();
    }
}

function displayCurrentWeather(data) {
    cityNameEl.textContent = `${data.name}, ${data.sys.country}`;
    dateTimeEl.textContent = formatDateTime(data.dt, data.timezone);
    weatherIcon.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
    weatherIcon.alt = data.weather[0].description;
    tempEl.textContent = Math.round(data.main.temp);
    descriptionEl.textContent = data.weather[0].description;
    humidityEl.textContent = `${data.main.humidity}%`;
    windSpeedEl.textContent = `${data.wind.speed} m/s`;
    
    statusMessage.textContent = "";
    statusMessage.className = "";
    weatherCard.classList.remove('hidden');
}

function displayForecast(data) {
    forecastContainer.innerHTML = '';
    
    // Process forecast data to get daily forecasts
    const dailyForecasts = {};
    
    data.list.forEach(item => {
        const date = new Date((item.dt + data.city.timezone - 3600) * 1000).toISOString().split('T')[0];
        
        if (!dailyForecasts[date]) {
            dailyForecasts[date] = {
                date: date,
                temp: item.main.temp,
                icon: item.weather[0].icon,
                description: item.weather[0].description
            };
        }
    });
    
    // Convert to array and take first 5 days
    const forecastArray = Object.values(dailyForecasts).slice(0, 5);
    
    if (forecastArray.length > 0) {
        forecastArray.forEach(day => {
            const dateObj = new Date(day.date);
            const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
            
            const forecastItem = document.createElement('div');
            forecastItem.className = 'forecast-item';
            forecastItem.innerHTML = `
                <div class="forecast-date">${dayName}</div>
                <img src="https://openweathermap.org/img/wn/${day.icon}.png" alt="${day.description}">
                <div class="forecast-temp">${Math.round(day.temp)}°C</div>
            `;
            forecastContainer.appendChild(forecastItem);
        });
        
        forecastSection.classList.remove('hidden');
    } else {
        forecastSection.classList.add('hidden');
    }
}

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