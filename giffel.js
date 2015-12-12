"use strict";

/*
    1. Get list of images to display
    2. Feed image list to image loader
    3. Loader loads images, and emits them
    4. Cycler receives new images, and adds them to its queue
    5. Cycler repeatedly displays images from its queue
*/

var INTERVAL_SECONDS = 8;
var ANIMATION_DURATION = 3;

function loadImages(urls, callback) {
    if (urls.length === 0) {
        console.log("All images loaded!");
        return;
    }

    function loadImage(url, callback) {
        var img = document.createElement("img");
        img.onload = function(e) {
            callback(img);
        }
        img.onerror = function(e) {
            console.error("Error loading image: " + e.message);
        }
        console.log("Loading:", url);
        img.src = url;
    }

    var queue = [].concat(urls);

    loadImage(queue.shift(), function(img) {
        callback(img);
        loadImages(queue, callback);
    });
}

// Starts cycling images and returns a function used to add new images into queue
function cycleImages() {
    var currentIndex = -1;
    var queue = [];
    var interval = null;

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
    var oldImage = document.querySelector(".current-image");
    if (oldImage) {
        setTimeout(function() {
            oldImage.parentNode.removeChild(oldImage);
        }, ANIMATION_DURATION * 1000);
    }
    var newImage = document.createElement("div");
    newImage.innerHTML = '<div class="current-image fullscreen fade-in" ' +
        'style="background-image: url(' + url + ')"></div>';
    document.body.appendChild(newImage.firstChild);
}

function extractGifUrls(res) {
    function suffix(str) {
        return str.substring(str.lastIndexOf("."));
    }

    return res.map(function(c) {
            return c.data.url;
        })
        .filter(function(url) {
            return url && suffix(url) === ".gif" || suffix(url) === ".gifv";
        }).map(function(url) {
            if (suffix(url) === ".gifv") {
                return url.substring(0, url.lastIndexOf(".gifv")) + ".gif";
            }
            return url;
        });
}

axios.get("https://www.reddit.com/r/perfectloops/.json")
    .then(function(response) {
        return extractGifUrls(response.data.data.children)
    })
    .then(function start(urls) {
        var addImageCallback = cycleImages();
        loadImages(urls, addImageCallback);
    })
    .catch(function(err) {
        document.body.innerHTML = "Couldn't get list of images to show, sorry! " + err.message;
    });
