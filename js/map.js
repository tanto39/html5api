if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(success, showError);
} else {
  alert("Geolocation не поддерживается данным браузером.");
}

function success(position) {
  localStorage.setItem("lastPosition", JSON.stringify({
      latitude: position.coords.latitude,
      longitude: position.coords.longitude
  }));
}

function showError(error) {
  alert("Не удалось определить местоположение: " + error.message);
}


function init() {
  let lat = 0;
  let long = 0;

  const options = {
    enableHighAccuracy: true,
    timeout: 5000,
    maximumAge: 0,
  };

  // Определение геолокации, проверка поддержки геолокации
  function getPosition() {
    return new Promise((res, rej) => {
      navigator.geolocation.getCurrentPosition(res, rej, options);
    });
  }

  if (navigator.geolocation) {
    //navigator.geolocation.getCurrentPosition(success, error, options);
    getPosition().then((res) => {
      lat = res.coords.latitude;
      long = res.coords.longitude;

      if (lat === 0 || long === 0) {
        alert("Не удалось определить местоположение");
      }
      // Показ карты
      showMap(lat, long);
    });
  } else {
    alert("Geolocation не поддерживается данным браузером.");
  }
}

// Создание карты с текущим местоположением
function showMap(lat, long) {
  let map = new ymaps.Map("map", {
    center: [lat, long],
    zoom: 12,
  });

  let placemark = new ymaps.Placemark([lat, long], {
    balloonContent: "Вы здесь",
  });

  map.geoObjects.add(placemark);

  // Запись местоположения в localStorage
  localStorage.setItem(
    "lastPosition",
    JSON.stringify({
      latitude: lat,
      longitude: long,
    })
  );

  // Получение последнего местоположения из localStorage
  let lastPosition = localStorage.getItem("lastPosition");
  if (lastPosition) {
    var coords = JSON.parse(lastPosition);
    addMarker(map, coords, "Последняя геопозиция");
  }

  // Добавление новой метки
  map.events.add("click", function (e) {
    let coords = e.get("coords");
    console.log(coords);
    addMarker(map, coords, "Новое место");
  });

  loadMarkers(map);
}

// Добавление новой метки и запись ее в localStorage
function addMarker(map, coords, title) {
  let placemark = new ymaps.Placemark(coords, {
    balloonContent: title,
  });

  map.geoObjects.add(placemark);

  if (title === "Новое место") {
    let markers = JSON.parse(localStorage.getItem("markers")) || [];
    markers.push({
      latitude: coords[0],
      longitude: coords[1],
      title: title,
      date: new Date().toISOString(),
    });

    localStorage.setItem("markers", JSON.stringify(markers));
  }
}

// Получение меток из localStorage
function loadMarkers(map) {
  let markers = JSON.parse(localStorage.getItem("markers")) || [];

  markers.forEach(function (marker) {
    let placemark = new ymaps.Placemark([marker.latitude, marker.longitude], {
      balloonContent: marker.title + "<br>Дата: " + marker.date,
    });

    map.geoObjects.add(placemark);
  });
}

document.addEventListener("DOMContentLoaded", function () {
  ymaps.ready(init);
});
