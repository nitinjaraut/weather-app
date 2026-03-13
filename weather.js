const userTab = document.querySelector("[data-userWeather]");
const searchTab = document.querySelector("[data-searchWeather]");
const userContainer = document.querySelector(".weather-container");

const grantAccessContainer = document.querySelector(".grant-location-container");
const searchForm = document.querySelector("[data-searchForm]");
const loadingScreen = document.querySelector(".loading-container");
const userInfoContainer = document.querySelector(".user-info-container");

let oldTab = userTab;
const API_KEY = "d1845658f92b31c64bd94f06f7188c9c";

oldTab.classList.add("current-tab");
getfromSessionStorage();

function switchTab(newTab) {
    if (newTab !== oldTab) {
        oldTab.classList.remove("current-tab");
        oldTab = newTab;
        oldTab.classList.add("current-tab");

        if (!searchForm.classList.contains("active")) {
            // move to search tab
            userInfoContainer.classList.remove("active");
            grantAccessContainer.classList.remove("active");
            searchForm.classList.add("active");
        } else {
            // move back to "Your Weather"
            searchForm.classList.remove("active");
            userInfoContainer.classList.remove("active");
            getfromSessionStorage();
        }
    }
}

userTab.addEventListener("click", () => switchTab(userTab));
searchTab.addEventListener("click", () => switchTab(searchTab));

function getfromSessionStorage() {
    const localCoordinates = sessionStorage.getItem("user-coordinates");
    if (!localCoordinates) {
        // show Grant Access container
        grantAccessContainer.classList.add("active");
    } else {
        const coordinates = JSON.parse(localCoordinates);
        fetchUserWeatherInfo(coordinates);
    }
}

async function fetchUserWeatherInfo(coordinates) {
    const { lat, lon } = coordinates;
    grantAccessContainer.classList.remove("active");
    loadingScreen.classList.add("active");

    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
        );
        const data = await response.json();

        loadingScreen.classList.remove("active");
        userInfoContainer.classList.add("active");
        renderWeatherInfo(data);
    } catch (err) {
        loadingScreen.classList.remove("active");
        alert("Failed to fetch weather. Please try again!");
    }
}

function renderWeatherInfo(weatherInfo) {
    const cityName = document.querySelector("[data-cityName]");
    const countryIcon = document.querySelector("[data-countryIcon]");
    const desc = document.querySelector("[data-weatherDesc]");
    const weatherIcon = document.querySelector("[data-weatherIcon]");
    const temp = document.querySelector("[data-temp]");
    const windspeed = document.querySelector("[data-windspeed]");
    const humidity = document.querySelector("[data-humidity]");
    const cloudiness = document.querySelector("[data-cloudiness]");
    const feelslike = document.querySelector("[data-feelslike]");
    const feelsIcon = document.querySelector("[data-feelsIcon]"); // new

    const iconUrl = weatherInfo?.weather?.[0]?.icon
        ? `https://openweathermap.org/img/wn/${weatherInfo.weather[0].icon}@2x.png`
        : "";

    cityName.innerText = weatherInfo?.name || "N/A";
    countryIcon.src = weatherInfo?.sys?.country
        ? `https://flagcdn.com/144x108/${weatherInfo.sys.country.toLowerCase()}.png`
        : "";
    desc.innerText = weatherInfo?.weather?.[0]?.description || "N/A";
    weatherIcon.src = iconUrl;
    temp.innerText = weatherInfo?.main?.temp ? `${weatherInfo.main.temp} °C` : "N/A";
    windspeed.innerText = weatherInfo?.wind?.speed ? `${weatherInfo.wind.speed} m/s` : "N/A";
    humidity.innerText = weatherInfo?.main?.humidity ? `${weatherInfo.main.humidity}%` : "N/A";
    cloudiness.innerText = weatherInfo?.clouds?.all ? `${weatherInfo.clouds.all}%` : "N/A";
    feelslike.innerText = weatherInfo?.main?.feels_like ? `${weatherInfo.main.feels_like} °C` : "N/A";
    feelsIcon.src = iconUrl; // same as main weather icon
}

function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition);
    } else {
        alert("Geolocation not supported by your browser.");
    }
}

function showPosition(position) {
    const userCoordinates = {
        lat: position.coords.latitude,
        lon: position.coords.longitude,
    };
    sessionStorage.setItem("user-coordinates", JSON.stringify(userCoordinates));
    fetchUserWeatherInfo(userCoordinates);
}

const grantAccessButton = document.querySelector("[data-grantAccess]");
grantAccessButton.addEventListener("click", getLocation);

const searchInput = document.querySelector("[data-searchInput]");

searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    let cityName = searchInput.value.trim();

    if (cityName !== "") {
        fetchSearchWeatherInfo(cityName);
    }
});

async function fetchSearchWeatherInfo(city) {
    loadingScreen.classList.add("active");
    userInfoContainer.classList.remove("active");
    grantAccessContainer.classList.remove("active");

    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
        );
        const data = await response.json();

        loadingScreen.classList.remove("active");
        if (data.cod === "404") {
            alert("City not found!");
            return;
        }
        userInfoContainer.classList.add("active");
        renderWeatherInfo(data);
    } catch (err) {
        loadingScreen.classList.remove("active");
        alert("Failed to fetch city weather!");
    }
}