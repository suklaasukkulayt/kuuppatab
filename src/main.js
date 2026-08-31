import "./style.css";
const API_KEY = import.meta.env.VITE_NASA_API_KEY;

document.querySelector("#app").innerHTML = "<p>Nasa section intializing...</p>";

var currentTime = "";
      function timeUpdate() {
      currentTime = new Date().toLocaleString([], {hour: '2-digit', minute:'2-digit'});
      var timeText = document.querySelector("#timetext");
     if (timeText) {
        timeText.innerHTML = currentTime;
      }
    }
    setInterval(timeUpdate, 1000);

fetch(`https://api.nasa.gov/planetary/apod?api_key=${API_KEY}`)
.then(response => response.json())
.then(data => {
    timeUpdate();
    let media;
    let backgroundUrl = data.url;

    if (data.media_type === "image") {
        media = `<img src="${data.url}" class="nasamedia"/>`;

    } else if (data.media_type === "video") {
        media = `<video src="${data.url}" controls class="nasamedia"></video>`;
    } else if (data.url.includes("youtube")){
        media = `<iframe width="500" height="500" src="${data.url}" class="nasamedia" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></video>`;
    }

    document.querySelector("#app").innerHTML = `
    <h1 id="nasatitle">${data.title}</h1>
    ${media}
    <p id="nasadesc">${data.explanation}</p>
`;
})
fetch(`https://images-api.nasa.gov/search?q=nebula&media_type=image&page_size=100`)
.then(response => response.json())
.then(async data => {
    timeUpdate();
const images = data.collection.items 
.map(item => {
     const imageData = item.data?.[0];
     const nasaId = imageData?.nasa_id;

    return {
        id: nasaId,
        title: imageData?.title || "NASA Image",
        description: imageData?.description || ""
    };
})
    .filter(image => image.id);

    if (images.length === 0) {
        throw new Error("No NASA images found.");
    }
        const day = Math.floor(Date.now() / 86400000);
        const imageIndex = day % images.length;
        const selectedImage = images[imageIndex];
        const assetResponse = await fetch(
    `https://images-api.nasa.gov/asset/${selectedImage.id}`
);
    const assetData = await assetResponse.json();
    const originalImage = assetData.collection.items.find(
        item => item.href.includes("~orig")
);

    if (!originalImage) {
        throw new Error("Original NASA image not found.");
}

    selectedImage.url = originalImage.href;
    document.body.style.backgroundImage = `url("${selectedImage.url}")`;
})
.catch(err => {
    document.querySelector("#app").innerHTML = `<p>Error: ${err.message}</p>`;
});



function doSearch(){
    event.preventDefault()
    const search = document.querySelector("#searchInput").value.trim()
    if (search !== "") {
        window.location.href =
            `https://www.google.com/search?q=${encodeURIComponent(search)}`
    }
}

document.querySelector("#searchBar").addEventListener("submit", function(event) {
    doSearch();
})

document.querySelector("#searchButton").addEventListener("click", () => {
    doSearch();
})

function weatherCodeToEmoji(code) {
  const weatherIcons = {
    0: "☀️",
    1: "🌤️",
    2: "⛅",
    3: "☁️",
    45: "🌫️",
    48: "🌫️",
    51: "🌦️",
    61: "🌧️",
    71: "🌨️",
    95: "⛈️"
  };

  return weatherIcons[code] || "🌍";
}

async function getLocationName(lat, lon) {
  const providers = [
    `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`,
    `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&zoom=10&accept-language=en`
  ];

  for (const url of providers) {
    try {
      const response = await fetch(url, {
        headers: {
          Accept: "application/json"
        }
      });

      if (!response.ok) {
        continue;
      }

      const data = await response.json();
      const city = data.city || data.locality || data.address?.city || data.address?.town || data.address?.village || data.address?.suburb || "";
      const region = data.principalSubdivision || data.address?.state || data.address?.county || "";
      const country = data.countryName || data.address?.country || "";
      const label = [city, region, country].filter(Boolean).join(", ");

      if (label) {
        return label;
      }
    } catch (error) {
      console.warn("Could not resolve location name with provider", url, error);
    }
  }

  return `${lat.toFixed(2)}, ${lon.toFixed(2)}`;
}

async function showWeather(lat, lon) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&timezone=auto`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    const temp = data.current.temperature_2m;
    const code = data.current.weather_code;
    const icon = weatherCodeToEmoji(code);
    const locationName = await getLocationName(lat, lon);

    const weatherIcon = document.querySelector("#weather-icon");

    if (weatherIcon) {
      weatherIcon.textContent = icon;
    }

    document.querySelector("#weathercontent").innerHTML = `
      <p>${locationName || "Your location"}</p>
      <p>${temp}°C</p>
    `;
  } catch {
    document.querySelector("#weathercontent").innerHTML =
      "<p>Weather could not be loaded.</p>";
  }
}

function getUserWeather() {
  if (!navigator.geolocation) {
    document.querySelector("#weathercontent").innerHTML =
      "<p>Geolocation is not supported by this browser.</p>";
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      showWeather(position.coords.latitude, position.coords.longitude);
    },
    () => {
      document.querySelector("#weathercontent").innerHTML =
        "<p>Location access was denied.</p>";
    }
  );
}

getUserWeather();
setInterval(getUserWeather, 10 * 60 * 1000);