import "./style.css";
import editIcon from "./assets/edit.png";

if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
        navigator.serviceWorker.register("/sw.js");
    });
}

const API_KEY = import.meta.env.VITE_NASA_API_KEY;
const SETTINGS_KEY = "kuuppatab-settings";

const defaultSettings = {
  searchEngine: "google",
  hideWeather: false,
  hideNasa: false,
  hideArrow: false
};
let settings = {
  ...defaultSettings,
  ...JSON.parse(localStorage.getItem(SETTINGS_KEY) || "{}")
};
let searchEngine = settings.searchEngine;

function saveSettings() {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

function applySettings() {
  searchEngine = settings.searchEngine;
  const weatherEl = document.querySelector("#iamweather");
  if (weatherEl) weatherEl.hidden = settings.hideWeather;
  const appEl = document.querySelector("#app");
  if (appEl) appEl.hidden = settings.hideNasa;
  document.body.classList.toggle("hide-arrow", settings.hideArrow);
}



document.querySelector("#settingsButton").addEventListener("click", () => {
  const panel = document.querySelector("#settingsPanel");
  if (panel) panel.hidden = !panel.hidden;
});

document.querySelector("#searchEngineSelect").addEventListener("change", (event) => {
  settings.searchEngine = event.target.value;
  saveSettings();
  applySettings();
});

document.querySelector("#hideWeatherToggle").addEventListener("change", (event) => {
  settings.hideWeather = event.target.checked;
  saveSettings();
  applySettings();
  settingsCheck();
});

document.querySelector("#hideNasaToggle").addEventListener("change", (event) => {
  settings.hideNasa = event.target.checked;
  saveSettings();
  applySettings();
  settingsCheck();
});

document.querySelector("#hideArrowToggle").addEventListener("change", (event) => {
  settings.hideArrow = event.target.checked;
  saveSettings();
  applySettings();
});

document.querySelector("#searchEngineSelect").value = settings.searchEngine;
document.querySelector("#hideWeatherToggle").checked = settings.hideWeather;
document.querySelector("#hideNasaToggle").checked = settings.hideNasa;
document.querySelector("#hideArrowToggle").checked = settings.hideArrow;
applySettings();
settingsCheck();

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

if (!settings.hideNasa) {
fetch(`https://api.nasa.gov/planetary/apod?api_key=${API_KEY}`)
.then(response => response.json())
.then(data => {
    timeUpdate();
    let media;

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
})}


function settingsCheck() {
if (settings.hideNasa) {
    document.getElementById("app").style.display = "none";
}

if (settings.hideWeather) {
    document.getElementById("iamweather").style.display = "none";
} 
}

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

function doSearch(event) {
  event.preventDefault();
  const search = document.querySelector("#searchInput").value.trim();
  if (!search) return;

  const urls = {
    google: `https://www.google.com/search?q=${encodeURIComponent(search)}`,
    duckduckgo: `https://duckduckgo.com/?q=${encodeURIComponent(search)}`,
    bing: `https://www.bing.com/search?q=${encodeURIComponent(search)}`
  };
  window.location.href = urls[settings.searchEngine] || urls.google;
}

document.querySelector("#searchBar").addEventListener("submit", doSearch);
document.querySelector("#searchButton").addEventListener("click", doSearch);

function weatherCodeToEmoji(code) {
  const weatherIcons = {
    0: "☀️",
    1: "🌤️",
    2: "⛅",
    3: "☁️",
    45: "🌫️",
    48: "🌫️",
    51: "🌦️",
    53: "☔",
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
      const region = "";
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
      <p class="weathertext" style="font-size: 23px;">${temp}°C</p>
      <p class="weathertext" style="font-size: 10px;">${locationName || "Your location"}</p>

    `;
  } catch {
    document.querySelector("#weathercontent").innerHTML =
      "<p class='weathertext'>Weather could not be loaded.</p>";
  }
}

function getUserWeather() {
  if (!navigator.geolocation) {
    document.querySelector("#weathercontent").innerHTML =
      "<p class='weathertext'>Geolocation is not supported by this browser.</p>";
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      showWeather(position.coords.latitude, position.coords.longitude);
    },
    () => {
      document.querySelector("#weathercontent").innerHTML =
        "<p class='weathertext'>Location access was denied.</p>";
    }
  );
}

if (!settings.hideWeather) {
  getUserWeather();
  setInterval(getUserWeather, 10 * 60 * 1000);
}

const QUICK_LINKS_KEY = "kuuppatab-quick-links";
let quickLinks = JSON.parse(
    localStorage.getItem(QUICK_LINKS_KEY) || "[]"
);

let editingQuickLinkIndex = null;
function saveQuickLinks() {
    localStorage.setItem(
        QUICK_LINKS_KEY,
        JSON.stringify(quickLinks)
    );
}

function getFavicon(url) {
    try {
        const hostname = new URL(url).hostname;
        return `https://www.google.com/s2/favicons?domain=${hostname}&sz=64`;
    } catch {
        return "";
    }
}

function renderQuickLinks() {
    const container = document.querySelector("#quickLinks");
    if (!container) {
        return;
    }

    container.innerHTML = "";
    quickLinks.forEach((link, index) => {
        const item = document.createElement("div");
        item.className = "quickLink";
        const icon = document.createElement("img");
        icon.className = "quickLinkIcon";
        icon.src = link.icon || getFavicon(link.url);
        icon.alt = "";
        icon.onerror = () => {
            icon.src = "";
            icon.style.display = "none";
        };

        const name = document.createElement("div");
        name.className = "quickLinkName";
        name.textContent = link.name;
        item.appendChild(icon);
        item.appendChild(name);
        item.addEventListener("click", () => {
            window.location.href = link.url;
        });

        const editButton = document.createElement("button");
        const editImage = document.createElement('img');
        
        editButton.appendChild(editImage);
        editButton.className = "quickLinkEdit";
        editButton.type = "button";
        editImage.src = editIcon;
        editImage.alt = "✏️";
        editButton.appendChild(editImage);

        editButton.addEventListener("click", event => {
            event.stopPropagation();
            openQuickLinkEditor(index);
        });
        item.appendChild(editButton);
        container.appendChild(item);
    });

    const addButton = document.createElement("div");
    addButton.className = "quickLink";
    addButton.classList.add("quickLinkAdd");
    addButton.innerHTML = `
        <div class="quickLinkAddIcon">+</div>
        <div class="quickLinkName">Add</div>
    `;
    addButton.addEventListener("click", () => {
        openQuickLinkEditor();
    });

    container.appendChild(addButton);
}

function openQuickLinkEditor(index = null) {
    editingQuickLinkIndex = index;

    const mod = document.querySelector("#quickLinkMod");
    const title = document.querySelector("#quickLinkModTitle");
    const nameInput = document.querySelector("#quickLinkName");
    const urlInput = document.querySelector("#quickLinkUrl");
    const iconInput = document.querySelector("#quickLinkIcon");
    const deleteButton = document.querySelector("#quickLinkDelete");

    if (index === null) {
        title.textContent = "Add a bookmark";
        nameInput.value = "";
        urlInput.value = "";
        deleteButton.style.display = "none";
        document.querySelector("#quickLinkIcon").style.display = "none";
    } else {
        const link = quickLinks[index];
        title.textContent = "Edit your bookmark";
        nameInput.value = link.name;
        urlInput.value = link.url;
        iconInput.value = link.icon || "";
        deleteButton.style.display = "block";
        document.querySelector("#quickLinkIcon").style.display = "flex";
    }
    
    mod.classList.add("open");
    nameInput.focus();
}

function closeQuickLinkEditor() {
    document.querySelector("#quickLinkMod").classList.remove("open");
    editingQuickLinkIndex = null;
}

document
    .querySelector("#quickLinkCancel")
    .addEventListener("click", closeQuickLinkEditor);

document
    .querySelector("#quickLinkSave")
    .addEventListener("click", () => {
        const name = document.querySelector("#quickLinkName").value.trim();
        const url = document.querySelector("#quickLinkUrl").value.trim();
        const icon = document.querySelector("#quickLinkIcon").value.trim();
        if (!name || !url) {
            return;
        }
        const newLink = {
            name,
            url,
            icon
        };

        if (editingQuickLinkIndex === null) {
            quickLinks.push(newLink);
        } else {
            quickLinks[editingQuickLinkIndex] = newLink;
        }
        saveQuickLinks();
        renderQuickLinks();
        closeQuickLinkEditor();
    });

document
    .querySelector("#quickLinkDelete")
    .addEventListener("click", () => {
        if (editingQuickLinkIndex === null) {
            return;
        }
        quickLinks.splice(editingQuickLinkIndex, 1);
        saveQuickLinks();
        renderQuickLinks();
        closeQuickLinkEditor();
    });

document
    .querySelector("#quickLinkMod")
    .addEventListener("click", event => {
        if (event.target.id === "quickLinkMod") {
            closeQuickLinkEditor();
        }
    });

renderQuickLinks();