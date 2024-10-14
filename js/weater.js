document.addEventListener("DOMContentLoaded", function () {
  if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(showWeather, showError);
  } else {
      alert("Geolocation не поддерживается данным браузером.");
  }

  function showWeather(position) {
      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;
      const apiKey = 'f2aa67059f1a904e779d407a8df84f2d';
      const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&lang=ru&appid=${apiKey}`;

      fetch(url)
          .then(response => response.json())
          .then(data => {
              document.querySelector('.location').innerText = `Местоположение: ${data.name}, ${data.sys.country}`;
              document.querySelector('.weather').innerText = `Погода: ${data.weather[0].description}`;
              document.querySelector('.temperature').innerText = `Температура: ${data.main.temp}°C`;
              document.querySelector('.temperature_feels').innerText = `Ощущается: ${data.main.feels_like}°C`;
              document.querySelector('.pressure').innerText = `Давление: ${data.main.pressure} гПа`;
              document.querySelector('.wind').innerText = `Скорость ветра: ${data.wind.speed} м/с`;

              const icon = data.weather[0].icon;
              const iconUrl = `http://openweathermap.org/img/wn/${icon}@2x.png`;
              document.getElementById('weather-icon').style.backgroundImage = `url(${iconUrl})`;
          })
          .catch(error => {
              alert(`Не удалось получить данные о погоде. ${error}`);
          });
  }

  function showError(error) {
      alert("Не удалось определить местоположение: " + error.message);
  }
});
