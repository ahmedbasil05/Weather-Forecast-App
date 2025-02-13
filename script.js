const apiKey = "16c0b286ae9a773353c30cb0d5772228"; // Replace with your OpenWeather API key
let currentUnit = localStorage.getItem("unit") || "metric"; // Get saved unit
let lastCity = localStorage.getItem("lastCity") || ""; // Get last searched city

// Load last searched city on page load
if (lastCity) {
    getWeather(lastCity);
}

// Function to fetch weather data
async function fetchWeather(url, isForecast = false) {
    const weatherResult = document.getElementById("weather-result");

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.cod === "404") {
            weatherResult.innerHTML = "<p>City not found. Try again.</p>";
            return;
        }

        if (isForecast) {
            displayForecast(data);
        } else {
            displayWeather(data);
        }
    } catch (error) {
        weatherResult.innerHTML = "<p>Failed to fetch data. Try again later.</p>";
    }
}

// Function to display current weather
function displayWeather(data) {
    let temperature = data.main.temp;
    let unitSymbol = currentUnit === "metric" ? "°C" : "°F";

    let iconUrl = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;

    // Change background based on weather condition
    changeBackground(data.weather[0].main);

    document.getElementById("weather-result").innerHTML = `
        <h3>${data.name}, ${data.sys.country}</h3>
        <img src="${iconUrl}" alt="Weather Icon" class="weather-icon">
        <p>Temperature: ${temperature}${unitSymbol}</p>
        <p>Humidity: ${data.main.humidity}%</p>
        <p>Weather: ${data.weather[0].description}</p>
    `;

    // Save last searched city
    localStorage.setItem("lastCity", data.name);
}

// Function to get weather by city name
function getWeather(city = null) {
    city = city || document.getElementById("city").value;

    if (city.trim() === "") {
        document.getElementById("weather-result").innerHTML = "<p>Please enter a city name.</p>";
        return;
    }

    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=${currentUnit}`;
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=${currentUnit}`;

    fetchWeather(url);
    fetchWeather(forecastUrl, true);
}

// Function to get weather based on user's location
function getLocationWeather() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            const { latitude, longitude } = position.coords;
            const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=${currentUnit}`;
            const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=${currentUnit}`;

            fetchWeather(url);
            fetchWeather(forecastUrl, true);
        });
    } else {
        document.getElementById("weather-result").innerHTML = "<p>Geolocation is not supported by your browser.</p>";
    }
}

// Function to display 5-day forecast
function displayForecast(data) {
    const forecastDiv = document.getElementById("forecast");
    forecastDiv.innerHTML = "";

    for (let i = 0; i < data.list.length; i += 8) { // 8 entries per day
        let forecast = data.list[i];
        let date = new Date(forecast.dt * 1000).toDateString();
        let iconUrl = `https://openweathermap.org/img/wn/${forecast.weather[0].icon}.png`;

        forecastDiv.innerHTML += `
            <div class="forecast-item">
                <p>${date}</p>
                <img src="${iconUrl}" class="forecast-icon">
                <p>${forecast.main.temp}°</p>
            </div>
        `;
    }
}

// Function to change background based on weather
function changeBackground(weather) {
    let backgrounds = {
        "Clear": "#FFD700",
        "Clouds": "#B0C4DE",
        "Rain": "#4682B4",
        "Snow": "#F0F8FF",
        "Thunderstorm": "#708090"
    };

    document.body.style.background = backgrounds[weather] || "#2193b0";
}

// Function to toggle units
function toggleUnit() {
    currentUnit = currentUnit === "metric" ? "imperial" : "metric";
    localStorage.setItem("unit", currentUnit);
    getWeather();
}