import "./style.css";
const API_KEY = import.meta.env.VITE_NASA_API_KEY;

document.querySelector("#app").innerHTML = "<p>KuuppaTab intializing...</p>";

fetch(`https://api.nasa.gov/planetary/apod?api_key=${API_KEY}`)
.then(response => response.json())
.then(data => {
    
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
.then(data => {
const images = data.collection.items 
.map(item => {
     const imageData = item.data?.[0];
     const preview = item.links?.find(
        link => link.render === "image"
    );
    return {
        title: imageData?.title || "NASA Image",
        description: imageData?.description || "",
        url: preview?.href
    };
})
    .filter(image => image.url);

    if (images.length === 0) {
        throw new Error("No NASA images found."); }
        const day = Math.floor(Date.now() / 86400000);
        const imageIndex = day % images.length;
        const selectedImage = images[imageIndex];
    document.body.style.backgroundImage = `url("${selectedImage.url}")`;
})
.catch(err => {
    document.querySelector("#app").innerHTML = `<p>Error: ${err.message}</p>`;
});