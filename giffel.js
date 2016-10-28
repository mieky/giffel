"use strict";

/*
    1. Get list of images to display
    2. Feed image list to image loader
    3. Loader loads images, and emits them
    4. Cycler receives new images, and adds them to its queue
    5. Cycler repeatedly displays images from its queue
*/

const INTERVAL_SECONDS = 8;
const ANIMATION_DURATION = 3;

function loadImages(urls, callback) {
    if (urls.length === 0) {
        console.log("All images loaded!");
        return;
    }

    function loadImage(url, callback) {
        const img = document.createElement("img");
        img.onload = e => callback(img);
        img.onerror = e => console.error(`Error loading image: ${e.message}`);
        console.log("Loading:", url);
        img.src = url;
    }

    const queue = [].concat(urls);

    loadImage(queue.shift(), img => {
        callback(img);
        loadImages(queue, callback);
    });
}

// Starts cycling images and returns a function used to add new images into queue
function cycleImages() {
    let currentIndex = -1;
    let queue = [];
    let interval = null;

    function nextImage() {
        currentIndex = (currentIndex + 1) % (queue.length || 1);
        showImage(queue[currentIndex].src);
    }

    return function addToQueue(img) {
        console.log("Adding image to cycler queue:", img.src);
        queue.push(img);

        if (!interval) {
            nextImage();
            interval = setInterval(nextImage, INTERVAL_SECONDS * 1000);
        }
    };
}

function showImage(url) {
    // Wait for new image to animate in, then remove old
    const oldImage = document.querySelector(".current-image");
    if (oldImage) {
        setTimeout(() => oldImage.parentNode.removeChild(oldImage),
            ANIMATION_DURATION * 1000);
    }

    const newImage = document.createElement("div");
    newImage.innerHTML = `<div class="current-image fullscreen fade-in"
        style="background-image: url(${url})"></div>`;
    document.body.appendChild(newImage.firstChild);
}

function extractGifUrls(res) {
    const suffix = str => str.substring(str.lastIndexOf("."));
    return res
        .map(c => c.data.url)
        .filter(url => url && suffix(url) === ".gif" || suffix(url) === ".gifv")
        .map(url => {
            if (suffix(url) === ".gifv") {
                return url.substring(0, url.lastIndexOf(".gifv")) + ".gif";
            }
            return url;
        });
}

axios.get("https://www.reddit.com/r/perfectloops/.json")
    .then(res => extractGifUrls(res.data.data.children))
    .then(urls => loadImages(urls, cycleImages()))
    .catch(err => {
        document.body.innerHTML = `Couldn't get list of images to show, sorry! ${err.message}`;
    });
