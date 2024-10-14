ymaps.ready(init);

const options = {
  enableHighAccuracy: true,
  timeout: 5000,
  maximumAge: 0,
};

let firstMarkerCoords = null;

// Определение геолокации, проверка поддержки геолокации
if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(success, showError, options);
} else {
  alert("Geolocation не поддерживается данным браузером.");
}

function success(position) {
  // Запись местоположения в localStorage
  localStorage.setItem(
    "position",
    JSON.stringify({
      lat: position.coords.latitude,
      long: position.coords.longitude,
    })
  );
  // Последнее местоположение
  let lastPos = JSON.parse(localStorage.getItem("lastPosition"));
  if (!lastPos || (lastPos.lat != position.coords.latitude && lastPos.long != position.coords.longitude)) {
    localStorage.setItem(
      "lastPosition",
      JSON.stringify({
        lat: position.coords.latitude,
        long: position.coords.longitude,
      })
    );
  }
}

function showError(error) {
  alert("Не удалось определить местоположение: " + error.message);
}

// Создание карты с текущим местоположением
function init() {
  let pos = JSON.parse(localStorage.getItem("position"));

  let myMap = new ymaps.Map(
    "map",
    {
      center: [pos.lat, pos.long],
      zoom: 15,
      controls: ["geolocationControl", "searchControl", "routeButtonControl", "typeSelector", "fullscreenControl", "zoomControl", "rulerControl"],
    },
    {
      searchControlProvider: "yandex#search",
    }
  );

  // Текущее местоположение
  let placemark = new ymaps.Placemark(
    [pos.lat, pos.long],
    {
      balloonContent: "Вы здесь",
      iconCaption: "Вы здесь",
    },
    { preset: "islands#redCircleDotIcon" }
  );
  myMap.geoObjects.add(placemark);
  createRoute(map, placemark, pos.lat, pos.long);

  // Последнее местоположение
  let lastPos = JSON.parse(localStorage.getItem("lastPosition")) || {};
  let placemarkLast = new ymaps.Placemark(
    [lastPos.lat, lastPos.long],
    {
      balloonContent: "Последнее местоположение",
      iconCaption: "Последнее местоположение",
    },
    { preset: "islands#redIcon" }
  );
  myMap.geoObjects.add(placemarkLast);
  createRoute(map, placemarkLast, lastPos.lat, lastPos.long);

  //Добавление новой метки
  myMap.events.add("click", function (e) {
    let coords = e.get("coords");
    addMarker(myMap, coords, "Новое место");
  });

  loadMarkers(myMap);
}

// Добавление новой метки и запись ее в localStorage
function addMarker(map, coords, title) {
  let newDate = new Date().toISOString().split("T");
  let dateNow = `${newDate[0]} ${newDate[1].split(".")[0]}`;

  let placemarkNew = new ymaps.Placemark(coords, {
    balloonContent: getBaloonContent(title, dateNow, coords[0], coords[1], "Введите описание")
  });

  removeMarker(map, placemarkNew, coords[0], coords[1]);
  createRoute(map, placemarkNew, coords[0], coords[1]);

  if (title === "Новое место") {
    let markers = JSON.parse(localStorage.getItem("markers")) || [];
    markers.push({
      latitude: coords[0],
      longitude: coords[1],
      title: title,
      description: "Введите описание",
      date: dateNow,
    });

    localStorage.setItem("markers", JSON.stringify(markers));
  }

  map.geoObjects.add(placemarkNew);
}

// Получение меток из localStorage
function loadMarkers(map) {
  let markers = JSON.parse(localStorage.getItem("markers")) || [];

  markers.forEach(function (marker) {
    let placemarkNew = new ymaps.Placemark([marker.latitude, marker.longitude], {
      balloonContent: getBaloonContent(marker.title, marker.date, marker.latitude, marker.longitude, marker.description)
    });

    removeMarker(map, placemarkNew, marker.latitude, marker.longitude);
    createRoute(map, placemarkNew, marker.latitude, marker.longitude);

    map.geoObjects.add(placemarkNew);
  });
}

// Построение маршрута
function createRoute(map, placemark, lat, long) {
  placemark.events.add("click", function () {
    if (firstMarkerCoords === null) {
      firstMarkerCoords = [lat, long];
    } else {
      ymaps.route([firstMarkerCoords, [lat, long]]).then(
        function (route) {
          map.geoObjects.add(route);
        },
        function (error) {
          alert("Ошибка при построении маршрута: " + error.message);
        }
      );
      firstMarkerCoords = null;
    }
  });
}

// Удаление маркера
function removeMarker(map, placemark, lat, long) {
  placemark.events.add("contextmenu", function () {
    map.geoObjects.remove(placemark);

    let markers = JSON.parse(localStorage.getItem("markers")) || [];
    markers = markers.filter((marker) => !(marker.latitude === lat && marker.longitude === long));
    localStorage.setItem("markers", JSON.stringify(markers));
  });
}


function updateDescription(lat, long) {
  let markers = JSON.parse(localStorage.getItem("markers")) || [];
  let inputEl = document.getElementById(`descr-${lat}-${long}`);
  let newDescription = inputEl.value;
 
  for (let i = 0; i < markers.length; i++) {
    if (markers[i].latitude == lat && markers[i].longitude == long) {
        markers[i].description = newDescription;
        localStorage.setItem("markers", JSON.stringify(markers));
        break;
    }
  }

  window.location.reload(true);
}

// Формирование контента в метке
function getBaloonContent(title, date, lat, long, description){

  return `<div>
            ${title} <br>Дата и время: ${date} <br>
            <label">Описание: <input type="text" value="${description}" id="descr-${lat}-${long}" /></label>
            <button onclick="updateDescription('${lat}', '${long}')">Сохранить</button>
          </div>`
}