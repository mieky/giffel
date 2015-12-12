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
        }, 2000);
    }
    var newImage = document.createElement("div");
    newImage.innerHTML = '<div class="current-image fullscreen fade-in" ' +
        'style="background-image: url(' + url + ')"></div>';
    document.body.appendChild(newImage.firstChild);
}

// Try testing with e.g. http://localhost:8080/?http://i.imgur.com/HON37HH.gif,https://i.imgur.com/RNFpXtr.gif,http://i.imgur.com/rtjTZVP.gif,http://i.imgur.com/0hixygL.gif,http://i.imgur.com/N65P9gL.gif,http://i.imgur.com/9Siry0f.gif,http://i.imgur.com/sMilr1I.gif,https://i.imgur.com/97pDN6x.gif,http://i.imgur.com/Bk8j2Ax.gif,http://ak-hdl.buzzfed.com/static/2015-11/30/17/enhanced/webdr10/anigif_enhanced-1678-1448922451-13.gif,http://45.media.tumblr.com/2d6667e7a3d2bae53fa7b619be00e5ee/tumblr_n9y0x3HKeN1rv33k2o6_500.gif,http://i.imgur.com/Wmn1A0k.gif,https://49.media.tumblr.com/4f34bbb2eb2cb5e716bb81f6997e514c/tumblr_nykhdrhYGY1tl8u0ko1_400.gif

var urls = window.location.search.substring(1).split(",");

var addImageCallback = cycleImages();
loadImages(urls, addImageCallback);
