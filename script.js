const searchCity = document.querySelector(".search-bar");
const form = document.querySelector("#form");
const weatherContainer = document.querySelector(".weather-container");
const spinner = document.querySelector(".spinner");
const error = document.querySelector(".error ");



const getLocation = function () {
  if (!navigator.geolocation) {
    spinner.style.display = "none";
    return Promise.reject(new Error("Geolocation is not supported"));
  }

  return new Promise(function (resolve, reject) {
    navigator.geolocation.getCurrentPosition(resolve, (err) =>
      reject(
        new Error(
          `To See The Weather Allow It To Access Your Location (${err.message})`
        )
      )
    );
  });
};

function convertToFlag(countryCode) {
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt());
  return String.fromCodePoint(...codePoints);
}

const renderCity = function (data) {
  const timestamp = data.dt;
  const timezoneOffset = data.timezone;
  const localTimestamp = (timestamp + timezoneOffset) * 1000 - 3600000;
  const date = new Date(localTimestamp);
  const day = date.toLocaleDateString("en-US", { weekday: "long" });
  const time = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "numeric",
  });


  const { country } = data.sys;
  const city = data.name;
  const { speed } = data.wind;
  const { weather } = data;
  const { icon, description } = weather[0];
  const { temp, temp_max: high, temp_min: low, humidity } = data.main;

  let markUp = `
     <div class="weather-details">
      <div class="country-name">
          
          <h2 class="country"> ${city}, ${country} ${convertToFlag(country)}</h2>
          <h2 class="time">${day} ${time}</h2>

          </div>
          <div class="weather-description">
          <div class="temp-icon">
          <img
          class="icon-img"
          src="http://openweathermap.org/img/wn/${icon}@2x.png"
          />
          <h4 class="temp">${Math.floor(
            temp
          )} <span class="temp-i">°C</span></h4>
              <h3 class="des">${description}</h3>
            </div>
            <span>H:${Math.ceil(high)}°</span><span class="low">L:${Math.floor(
    low
  )}°</span>
          </div>
          <div class="weather-info">
              <span>Humidity: ${humidity}%</span>
              <span>Wind: ${Math.ceil(speed)} mph</span>
            </div>
            </div>
      `;

  weatherContainer.insertAdjacentHTML("afterbegin", markUp);
};

const renderError = function (msg) {
  error.textContent = `⛔️${msg}⛔️`;
 
};

const searchForCity = async function (city) {
  try {
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=02a70087b5928bc761bb5fcb427e25d9&units=metric`
    );
    const data = await res.json();

    if (data.cod === "404") {
      throw new Error(`City not found`);
    } else {
      spinner.style.display = "none";
      renderCity(data);
    }
  } catch (err) {
    renderError(` ${err} `);
  }
};
const weatherCal = async function () {
  try {
    const pos = await getLocation();
    const { latitude: lat, longitude: lon } = pos.coords;

    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=02a70087b5928bc761bb5fcb427e25d9&units=metric`
    );
    const data = await res.json();
    console.log("🚀 ~ file: script.js:116 ~ weatherCal ~ data:", data)

    if (data) {
      spinner.style.display = "none";
    }

    if (data.cod !== 200) {
      throw new Error(`Something went wrong (${data.cod})`);
    }

    renderCity(data);
  } catch (err) {
    console.log(`Error ${err}`);
    renderError(` ${err} `);
  }
};

weatherCal();

const displayCity = function (e) {
  e.preventDefault();
  const search = searchCity.value;
  searchForCity(search);
  searchCity.value = "";
  weatherContainer.innerHTML = "";
};

form.addEventListener("submit", displayCity);
