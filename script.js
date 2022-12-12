const searchCity = document.querySelector(".search-bar");
const form = document.querySelector("#form");
const weatherContainer = document.querySelector(".weather-container");
let spinner = document.querySelector(".spinner");
const searchIcon = document.querySelector(".fa-solid ");

// const getLocation = function () {
//   return new Promise(function (resolve, reject) {
//     if (navigator.geolocation)
//       navigator.geolocation.getCurrentPosition(resolve, reject);
//   });
// };
const getLocation = function () {
  return new Promise(function (resolve, reject) {
    if (navigator.geolocation)
      navigator.geolocation.getCurrentPosition(resolve, err=>reject(renderError(`To See The Weather Allow It To Access Your Locatin (${err.message})`)));
  });
};

const renderCity = function (data) {
  const date = Date.now();
  const timestamp = date + data.timezone * 1000;
  const date1 = new Date(timestamp);
  const day = date1.toDateString().slice(0, 4);
  const time = date1.toTimeString().slice(0, 5);
  const {icon} = data.weather[0];
  const { description } = data.weather[0];
  const { temp } = data.main;
  const { country } = data.sys;
  const city = data.name;
  const high = data.main.temp_max;
  const low = data.main.temp_min;
  const {humidity} = data.main;
  const {speed} = data.wind;
  let markUp = ` 
   <div class="weather-details">
    <div class="country-name">
        <h2 class="city">${city}</h2>
        <h2 class="country"> ${country}</h2>
        <h2 class="time">${day} ${time}</h2>
        
        </div>
        <div class="weather-description">
        <div class="temp-icon">
        <img
        class="icon-img"
        src="http://openweathermap.org/img/wn/${icon}@2x.png"
        />
        <h4 class="temp">${Math.floor(temp)} <span class="temp-i">°C</span></h4>
            <h3 class="des">${description}</h3>
          </div>
          <span>H:${high}°</span><span class="low">L:${low}°</span>
        </div>
        <div class="weather-info">
            <span>Humidity: ${humidity}%</span>
            <span>Wind: ${Math.ceil(speed)} mph</span>
          </div>
          </div>
    `;

  weatherContainer.insertAdjacentHTML("afterbegin", markUp);
  weatherContainer.style.background = "#8bf7f7";
};

const renderError = function (msg) {
  weatherContainer.insertAdjacentText("afterend", msg);
};

let searchForCity;
const weatherCal = async function () {
  try {

    const pos = await getLocation();
    const { latitude: lat, longitude: lon } = pos.coords;

    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=02a70087b5928bc761bb5fcb427e25d9&units=metric`
    );

    const data = await res.json();
    if (data.cod !== 200) {
      spinner.style.display = "none";
      throw new Error(`Something went wrong( ${data.cod})`);
    }
    renderCity(data);

    searchForCity = async function (city) {
      const res2 = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=02a70087b5928bc761bb5fcb427e25d9&units=metric`
      );

      const data2 = await res2.json();
      if (data2.cod !== 200) {
        spinner.style.display = "none";
        throw new Error(`City not found ( ${data2.cod})`);
      }

      renderCity(data2);
    };
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
searchIcon.addEventListener("click", displayCity);
