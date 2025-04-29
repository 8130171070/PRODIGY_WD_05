const apiKey = 'f60d79cdeba5f1fc1ddd7effd266ffd8'; // Replace with your OpenWeatherMap API key
const searchButton = document.getElementById("searchButton");
const useLocationButton = document.getElementById("useLocationButton");
const cityInput = document.getElementById("cityInput");
const modeToggle = document.getElementById("modeToggle");
const app = document.getElementById("appContainer");

let weatherChart = null;  // Variable to store the current chart

// Function to fetch weather data
async function fetchWeatherData(city) {
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.cod === "404") {
      alert("City not found!");
    } else if (response.ok) {
      displayCurrentWeather(data);
      changeBackground(data.weather[0].main);
      displayHourlyGraph(data);
    } else {
      throw new Error(data.message || "Unknown error occurred.");
    }
  } catch (error) {
    console.error("Error fetching weather data: ", error.message);
    alert("Failed to fetch weather data. Please try again.");
  }
}

// Display the current weather
function displayCurrentWeather(data) {
  const weatherDiv = document.getElementById("weatherResult");
  weatherDiv.innerHTML = `
    <h2>${data.name}, ${data.sys.country}</h2>
    <p>Weather: ${data.weather[0].main}</p>
    <p>Temperature: ${data.main.temp}°C</p>
    <p>Humidity: ${data.main.humidity}%</p>
    <p>Wind Speed: ${data.wind.speed} m/s</p>
  `;
}

// Change background based on weather condition
function changeBackground(condition) {
  let bg = "linear-gradient(to right, #1e3c72, #2a5298)";
  
  if (condition.includes("Rain")) {
    bg = "url('rainy-background.jpg')";
  } else if (condition.includes("Clear")) {
    bg = "url('sunny-background.jpg')";
  } else if (condition.includes("Cloud")) {
    bg = "url('cloudy-background.jpg')";
  } else if (condition.includes("Snow")) {
    bg = "url('snowy-background.jpg')";
  }

  app.style.backgroundImage = bg;
  app.style.backgroundSize = "cover";
  app.style.backgroundPosition = "center";
}

// Toggle Light/Dark mode
modeToggle.addEventListener("click", () => {
  document.body.classList.toggle("light-mode");
  document.querySelector(".container").classList.toggle("light-mode");
});

// Fetch weather data by city input
searchButton.addEventListener("click", () => {
  const city = cityInput.value.trim();
  if (city) {
    fetchWeatherData(city);
  } else {
    alert("Please enter a city name.");
  }
});

// Use user's location to fetch weather data
useLocationButton.addEventListener("click", () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((position) => {
      const { latitude, longitude } = position.coords;
      const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`;

      fetch(url)
        .then(response => {
          if (!response.ok) {
            throw new Error("Location weather fetch failed.");
          }
          return response.json();
        })
        .then(data => {
          displayCurrentWeather(data);
          changeBackground(data.weather[0].main);
          displayHourlyGraph(data);
        })
        .catch(error => {
          console.error("Error fetching location weather: ", error.message);
          alert("Failed to fetch weather data based on your location.");
        });
    }, (error) => {
      console.error("Geolocation error: ", error);
      alert("Unable to retrieve your location.");
    });
  } else {
    alert("Geolocation is not supported by this browser.");
  }
});

// Display hourly temperature graph using Chart.js
function displayHourlyGraph(data) {
  const temperatureData = data.main.temp;
  const timeLabels = ["Now"];

  // Destroy the existing chart if it exists
  if (weatherChart) {
    weatherChart.destroy();
  }

  const ctx = document.getElementById('hourlyGraph').getContext('2d');
  
  // Create a new chart
  weatherChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: timeLabels,
      datasets: [{
        label: 'Temperature (°C)',
        data: [temperatureData],
        borderColor: 'rgba(255, 99, 132, 1)',
        fill: false,
      }]
    }
  });
}