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
        media = `<video src="${data.url}" controls style="width: 300px; height: 300px;"></video>`;
    } else if (data.url.includes("youtube")){
        media = `<iframe width="300" height="300" src="${data.url}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></video>`;
    }

    document.querySelector("#app").innerHTML = `
    <h1>${data.title}</h1>
    ${media}
    <p>${data.explanation}</p>
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