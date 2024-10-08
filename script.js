const searchBtn = document.querySelector(".fa-solid.fa-magnifying-glass");
const cityInputField = document.querySelector(".weather__searchform");

document.addEventListener("DOMContentLoaded", () => {
  fetchWeatherData("Etawah");
});

searchBtn.addEventListener("click", () => {
  fetchWeatherData(cityInputField.value.trim() || "Etawah");
});

document.querySelector(".title").addEventListener("click", () => fetchWeatherData("Etawah"));

cityInputField.addEventListener("keyup", (event) => {
  if (event.key === "Enter") {
    fetchWeatherData(cityInputField.value.trim() || "Etawah");
  }
});




function timediff(datastorehours) {
  const now = new Date();
  const kathmanduOffset = 5.75;
  const kathmanduTime = new Date(now.getTime() + kathmanduOffset * 3600);
  const currentHour = kathmanduTime.getHours();
  const currentMinutes = kathmanduTime.getMinutes();
  const timeDifference = currentHour - datastorehours;
  console.log("--------|--------------|-----------")
  console.log("The time when the data was stored in the database:", datastorehours);
  console.log("The current hour in Kathmandu:", currentHour);
  console.log("The current minute in Kathmandu:", currentMinutes);
  console.log(`The data is just ${timeDifference} hour(s) old.`);
  console.log("--------|--------------|-----------")

  return timeDifference < 8;
}




function isToday(dateString) {
  const today = new Date();
  const date = new Date(dateString);
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}




async function fetchWeatherData(city) {
  cityInputField.value = "";
  try {
    const storedData = JSON.parse(localStorage.getItem(city));
    //search for data in local storage first  
    if (storedData &&isToday(storedData.current_weather.weather_date) &&
        timediff(parseInt(storedData.current_weather.data_stored_hour))){
        updateCurrentWeatherUI(storedData.current_weather);
        updateHistoricalWeatherUI(storedData.historical_weather);
        console.log(`Shown ${city}'s data from local storage.`);
    }
    //fetch the data from php if not available in local storage
    else
    {
        const response = await fetch(`http://localhost/main.php?city=${city}`);
        const data = await response.json();

        if (data.status === "success") {
          localStorage.setItem(city, JSON.stringify(data));
          const recentdata = JSON.parse(localStorage.getItem(city));
          updateCurrentWeatherUI(recentdata.current_weather);
          updateHistoricalWeatherUI(recentdata.historical_weather);
          console.log(`So, stored ${city}'s data in local storage from Database. Showing from local storage.`);
        } else {
          //if backend gives any error
        alert(`Error: ${data.message}`);
        }
    }
  } catch (error) {
    console.error("Error fetching data:", error);
    alert(`An error occurred while fetching data for ${city}.`);
  }
}





function updateCurrentWeatherUI(currentWeather) {
  const {
    city_name,
    temperature,
    description,
    country,
    humidity,
    wind,
    pressure,
    weather_date,
    icon,
  } = currentWeather;

  function convertCountryCode(country) {
    let regionNames = new Intl.DisplayNames(["en"], { type: "region" });
    return regionNames.of(country);
  }

  const roundedTemperature = Math.round(temperature);
  document.querySelector(".weather__icon img").src = `https://raw.githubusercontent.com/yuvraaaj/openweathermap-api-icons/master/icons/${icon}.png`;
  document.querySelector(".weather__city").textContent = city_name;
  document.querySelector(".weather__country").textContent =convertCountryCode(country);
  document.querySelector(".weather__temperature").textContent = `${roundedTemperature}°`;
  document.querySelector(".weather__forecast").textContent = description;
  document.querySelector(".weather__wind").textContent = `${wind} m/s`;
  document.querySelector(".weather__pressure").textContent = `${pressure} hPa`;
  document.querySelector(".weather__humidity").textContent = `${humidity}%`;
  document.querySelector(".weather__date").textContent = `${weather_date}`;
}





function updateHistoricalWeatherUI(historicalWeather) {
  const pastWeatherDiv = document.querySelector(".weather-pastdata");
  pastWeatherDiv.innerHTML = "";
  historicalWeather.forEach((entry, index) => {
    if (index < 7) {
      const iconUrl = `https://raw.githubusercontent.com/yuvraaaj/openweathermap-api-icons/master/icons/${entry.icon}.png`;
      const weatherEntryDiv = document.createElement("div");
      weatherEntryDiv.classList.add("day");
      weatherEntryDiv.classList.add(`day${index + 1}`);
      weatherEntryDiv.innerHTML = `
          <div class="day-name">${entry.weather_date}</div>
          <div class="weather-icon"><img src="${iconUrl}" alt="Weather Icon"></div>
          <div class="temperature">${Math.round(entry.temperature)}°</div>
          <div class="weather-condition">${entry.description}</div>`;
      pastWeatherDiv.appendChild(weatherEntryDiv);
    }
  });
}
