const apiKey = "124b92a8dd9ec01ffb0dbf64bc44af3c";

document.getElementById('search-button').addEventListener('click', fetchWeather);
document.getElementById('view-favorites-button').addEventListener('click', toggleFavoritesVisibility);
document.getElementById('add-city-button').addEventListener('click', addCity);
document.getElementById('language-dropdown').addEventListener('change', changeLanguage);

let isCelsius = true;

document.getElementById('toggleTempButton').addEventListener('click', toggleTemperatureUnit);

function toggleTemperatureUnit() {
    isCelsius = !isCelsius;
    document.getElementById('toggleTempButton').innerText = isCelsius ? 'Switch to Fahrenheit' : 'Switch to Celsius';
    const city = document.getElementById('city-input').value || document.getElementById('city-name').innerText;
    if (city) {
        fetchWeather();
    }
}

function fetchWeather() {
    const city = document.getElementById('city-input').value;
    const units = isCelsius ? 'metric' : 'imperial';
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=${units}`;

    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            if (data.cod === 200) {
                displayWeather(data);
                fetchForecast(city);
                updateMap(data.coord.lat, data.coord.lon);
            } else {
                alert('City not found!');
            }
        })
        .catch(error => console.error('Error fetching weather data:', error));
}

function displayWeather(data) {
    document.getElementById('city-name').innerText = data.name;
    document.getElementById('local-time').innerText = new Date().toLocaleTimeString();
    document.getElementById('weather-icon').src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
    document.getElementById('weather-condition').innerText = `Condition: ${data.weather[0].description}`;
    document.getElementById('humidity').innerText = `Humidity: ${data.main.humidity}%`;
    document.getElementById('wind-speed').innerText = `Wind Speed: ${data.wind.speed} m/s`;

    const temperature = isCelsius ? `${data.main.temp}°C` : `${data.main.temp}°F`;
    document.getElementById('temperature').innerText = `Temperature: ${temperature}`;
    changeBackground(data.weather[0].main.toLowerCase());
}

function fetchForecast(city) {
    const units = isCelsius ? 'metric' : 'imperial';
    const apiUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=${units}`;

    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            displayForecast(data);
        })
        .catch(error => console.error('Error fetching forecast data:', error));
}

function displayForecast(data) {
    const forecastContainer = document.getElementById('forecast-container');
    forecastContainer.innerHTML = '';
    for (let i = 0; i < data.list.length; i += 8) {
        const forecast = data.list[i];
        const forecastDay = document.createElement('div');
        forecastDay.classList.add('forecast-day');
        forecastDay.innerHTML = `
            <h3>${new Date(forecast.dt * 1000).toLocaleDateString()}</h3>
            <img src="https://openweathermap.org/img/wn/${forecast.weather[0].icon}@2x.png" alt="Weather Icon">
            <p>Temp: ${forecast.main.temp}°C</p>
            <p>${forecast.weather[0].description}</p>
        `;
        forecastContainer.appendChild(forecastDay);
    }
}

function changeBackground(weather) {
    const body = document.body;
    switch (weather) {
        case 'clear':
            body.style.backgroundImage = 'url(images/clear.jfif)';
            break;
        case 'clouds':
            body.style.backgroundImage = 'url(images/clouds.jfif)';
            break;
        case 'rain':
            body.style.backgroundImage = 'url(images/rain.jfif)';
            break;
        case 'snow':
            body.style.backgroundImage = 'url(images/snow.jfif)';
            break;
        default:
            body.style.backgroundImage = 'url(images/default.jfif)';
    }
}

function addCity() {
    const cityInput = document.getElementById('new-city');
    const cityName = cityInput.value.trim();
    if (cityName) {
        let favoriteCities = JSON.parse(localStorage.getItem('favoriteCities')) || [];
        if (!favoriteCities.includes(cityName)) {
            favoriteCities.push(cityName);
            localStorage.setItem('favoriteCities', JSON.stringify(favoriteCities));
            displayFavoriteCities();
        } else {
            alert("City already in favorites.");
        }
        cityInput.value = '';
    }
}

function loadFavoriteCities() {
    displayFavoriteCities();
}

function displayFavoriteCities() {
    const cityList = document.getElementById('city-list');
    cityList.innerHTML = '';
    let favoriteCities = JSON.parse(localStorage.getItem('favoriteCities')) || [];
    favoriteCities.forEach((city, index) => {
        const cityLi = document.createElement('li');
        cityLi.textContent = city;
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.onclick = () => deleteCity(index);
        cityLi.appendChild(deleteButton);
        cityList.appendChild(cityLi);
    });
}

function deleteCity(index) {
    let favoriteCities = JSON.parse(localStorage.getItem('favoriteCities')) || [];
    favoriteCities.splice(index, 1);
    localStorage.setItem('favoriteCities', JSON.stringify(favoriteCities));
    displayFavoriteCities();
}

function toggleFavoritesVisibility() {
    const favoritesList = document.getElementById('city-list');
    favoritesList.style.display = favoritesList.style.display === 'none' ? 'block' : 'none';
}

function changeLanguage() {
    const selectedLanguage = document.getElementById('language-dropdown').value;
    localStorage.setItem('preferredLanguage', selectedLanguage);
    applyTranslations(selectedLanguage);
}

window.addEventListener('load', () => {
    const preferredLanguage = localStorage.getItem('preferredLanguage') || 'en';
    document.getElementById('language-dropdown').value = preferredLanguage;
    applyTranslations(preferredLanguage);
    loadFavoriteCities();

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            const apiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

            fetch(apiUrl)
                .then(response => response.json())
                .then(data => {
                    displayWeather(data);
                    fetchForecast(data.name);
                    updateMap(lat, lon);
                })
                .catch(error => console.error('Error fetching weather data:', error));
        });
    }
});

document.addEventListener('DOMContentLoaded', function () {
    var map = L.map('map').setView([-15.3875, 28.3228], 10); 

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    L.marker([-15.3875, 28.3228]).addTo(map)
        .bindPopup('Lusaka, Zambia')
        .openPopup();
});

function updateMap(lat, lon) {
    var map = L.map('map').setView([lat, lon], 10);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    L.marker([lat, lon]).addTo(map)
        .bindPopup('Current Location')
        .openPopup();
}

function changeLanguage() {
    const selectedLanguage = document.getElementById('language-dropdown').value;
    localStorage.setItem('preferredLanguage', selectedLanguage);
    applyTranslations(selectedLanguage);
}

function applyTranslations(language) {
    const translations = {
        en: {
            search: "Search",
            viewFavorites: "View Favorites",
            addCity: "Add City",
            switchToFahrenheit: "Switch to Fahrenheit",
            switchToCelsius: "Switch to Celsius",
            cityNotFound: "City not found!",
            condition: "Condition",
            humidity: "Humidity",
            windSpeed: "Wind Speed",
            temperature: "Temperature",
            delete: "Delete"
        },
        fr: {
            search: "Recherche",
            viewFavorites: "Voir les favoris",
            addCity: "Ajouter une ville",
            switchToFahrenheit: "Passer à Fahrenheit",
            switchToCelsius: "Passer à Celsius",
            cityNotFound: "Ville non trouvée!",
            condition: "Condition",
            humidity: "Humidité",
            windSpeed: "Vitesse du vent",
            temperature: "Température",
            delete: "Supprimer"
        },
        es: {
            search: "Buscar",
            viewFavorites: "Ver Favoritos",
            addCity: "Agregar Ciudad",
            switchToFahrenheit: "Cambiar a Fahrenheit",
            switchToCelsius: "Cambiar a Celsius",
            cityNotFound: "¡Ciudad no encontrada!",
            condition: "Condición",
            humidity: "Humedad",
            windSpeed: "Velocidad del viento",
            temperature: "Temperatura",
            delete: "Eliminar"
        },
        zh: {
            search: "搜索",
            viewFavorites: "查看收藏",
            addCity: "添加城市",
            switchToFahrenheit: "切换到华氏度",
            switchToCelsius: "切换到摄氏度",
            cityNotFound: "找不到城市!",
            condition: "天气状况",
            humidity: "湿度",
            windSpeed: "风速",
            temperature: "温度",
            delete: "删除"
        },
        ar: {
            search: "بحث",
            viewFavorites: "عرض المفضلة",
            addCity: "أضف مدينة",
            switchToFahrenheit: "التبديل إلى فهرنهايت",
            switchToCelsius: "التبديل إلى مئوية",
            cityNotFound: "المدينة غير موجودة!",
            condition: "الحالة",
            humidity: "الرطوبة",
            windSpeed: "سرعة الرياح",
            temperature: "درجة الحرارة",
            delete: "حذف"
        },
        ru: {
            search: "Поиск",
            viewFavorites: "Просмотреть избранное",
            addCity: "Добавить город",
            switchToFahrenheit: "Переключиться на Фаренгейт",
            switchToCelsius: "Переключиться на Цельсий",
            cityNotFound: "Город не найден!",
            condition: "Состояние",
            humidity: "Влажность",
            windSpeed: "Скорость ветра",
            temperature: "Температура",
            delete: "Удалить"
        }
    };

    document.getElementById('search-button').innerText = translations[language].search;
    document.getElementById('view-favorites-button').innerText = translations[language].viewFavorites;
    document.getElementById('add-city-button').innerText = translations[language].addCity;
    document.getElementById('toggleTempButton').innerText = translations[language].switchToFahrenheit; 
}

document.getElementById('language-dropdown').addEventListener('change', changeLanguage);

document.addEventListener('DOMContentLoaded', () => {
    const preferredLanguage = localStorage.getItem('preferredLanguage') || 'en';
    document.getElementById('language-dropdown').value = preferredLanguage;
    applyTranslations(preferredLanguage);
});
