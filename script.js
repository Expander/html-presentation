'use strict;'

document.onkeydown = checkKey;

var page = 0;
var revealed = 0;
var hidden = 0;

var container = document.getElementById('container');
var slides = document.getElementById('slides');

function checkKey(event) {
    event = event || window.event;

    if (event.keyCode == '38') {
        showpage(page - 1);
    }
    else if (event.keyCode == '40') {
        showpage(page + 1);
    }
    else if (event.keyCode == '37') {
        showpage(page - 1);
    }
    else if (event.keyCode == '39' || event.keyCode == '32') {
        if (revealed < hidden) {
	    ++revealed;
	    reveal(container, 1);
        } else {
	    showpage(page + 1);
        }
    }
}

function reveal(e, n) {
    if (e.classList.contains("hidden")) {
        if (e.classList.contains("later")) { --n; };
        if (n == 0) {
            e.classList.toggle("hidden");
        }
    }
    if (n < 0) return n;
    for (child of e.children) {
        n = reveal(child, n);
        if (n < 0) return n;
    }
    return n;
}

function counthidden(e) {
    var n = 0;
    if (e.classList.contains("later")) {
        n = 1;
    }
    for (child of e.children) {
        n += counthidden(child);
    }
    return n;
}

function showpage(i) {
    if (i >= 0 && i < slides.childElementCount) {
        page = i;
        window.location.hash = `#${page}`;
        container.innerHTML =
            `<div class="${slides.children[i].classList}">` +
                slides.children[i].innerHTML +
                `<div class="pagenum">${page}/${slides.childElementCount}</div>` +
            `</div>`;
        revealed = 0;
        hidden = counthidden(container);
    }
}

// first change all .later and .same to .later.hidden and .same.hidden
function hide(e) {
    // document.write(e + " - " + e.childElementCount + " children.<p>");
    if (e.classList.contains("later") || e.classList.contains("same")) {
        e.classList.toggle("hidden");
    }
    for (child of e.children) {
        hide(child);
    }
}

// swipe gesture handling, detect swipes to left and right
function swipedetect(touchsurface, callback){
    let swipedir,
        startX,
        distX,
        threshold = 150, //required min distance traveled to be considered swipe
        allowedTime = 300, // maximum time allowed to travel that distance
        elapsedTime,
        startTime;

    touchsurface.addEventListener('touchstart', e => {
        var touchobj = e.changedTouches[0];
        swipedir = undefined;
        startX = touchobj.pageX;
        startTime = new Date().getTime();
        e.preventDefault();
    }, false);

    touchsurface.addEventListener('touchmove', e => {
        e.preventDefault(); // prevent scrolling when inside DIV
    }, false);

    touchsurface.addEventListener('touchend', e => {
        var touchobj = e.changedTouches[0];
        distX = touchobj.pageX - startX;
        elapsedTime = new Date().getTime() - startTime;
        if (elapsedTime <= allowedTime && Math.abs(distX) >= threshold) {
            swipedir = (distX < 0)? 'left' : 'right';
        }
        callback(swipedir);
        e.preventDefault();
    }, false);
}

// keep font size constant relative to container
function calcFont() {
    var fontWidth = 2 * container.clientWidth/window.innerWidth;
    return `${fontWidth}vw`;
}

function onResize() {
    container.style.fontSize = calcFont();
}

// set swipe detection for touch screens
swipedetect(document.querySelector('body'), swipedir => {
    switch (swipedir) {
    case 'left': checkKey({keyCode: 39}); break;
    case 'right': checkKey({keyCode: 38}); break;
    default: // nothing to do
    }
});

hide(slides);

if (window.location.hash) {
    page = parseInt(window.location.hash.substring(1));
}

window.addEventListener('resize', onResize);

showpage(page);
