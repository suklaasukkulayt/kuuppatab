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
        console.log(backgroundUrl);
    } else if (data.media_type === "video") {
        media = `<video src="${data.url}" controls style="width: 300px; height: 300px;"></video>`;
    } else if (data.url.includes("youtube")){
        media = `<iframe width="300" height="300" src="${data.url}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></video>`;
    }
    document.body.style.backgroundImage === "url(${data.url})";
    document.querySelector("#app").innerHTML = `
    <h1>${data.title}</h1>
    ${media}
    <p>${data.explanation}</p>
`;
})
.catch(err => {
    document.querySelector("#app").innerHTML = `<p>Error: ${err.message}</p>`;
});