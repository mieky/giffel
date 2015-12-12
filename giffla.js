"use strict";

/*
    urls -> image loader -> (image*) -> image cycler

    1. get list of images to display
    2. feed image list to image loader
    3. loader loads images, and emits them
    4. cycler receives new images, and adds them to its queue
    5. cycler repeatedly displays images from its queue
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

var defaults = "?http://i.imgur.com/sMilr1I.gif,http://i.imgur.com/Bk8j2Ax.gif,http://45.media.tumblr.com/2d6667e7a3d2bae53fa7b619be00e5ee/tumblr_n9y0x3HKeN1rv33k2o6_500.gif,http://i.imgur.com/HON37HH.gif,https://i.imgur.com/RNFpXtr.gif";
var search = window.location.search || defaults;
var urls = search.substring(1).split(",");

var addImageCallback = cycleImages();
loadImages(urls, addImageCallback);
