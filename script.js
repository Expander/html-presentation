'use strict;'

document.onkeydown = checkKey;
window.onresize = onResize;

let page = 0;
let revealed = 0;
let hidden = 0;

let container = document.getElementById('container');
let slides = document.getElementById('slides');

function checkKey(event) {
    event = event || window.event;

    if (event.keyCode == '38') {
        showPage(page - 1);
    } else if (event.keyCode == '40') {
        showPage(page + 1);
    } else if (event.keyCode == '37') {
        showPage(page - 1);
    } else if (event.keyCode == '39' || event.keyCode == '32') {
        if (revealed < hidden) {
	    ++revealed;
	    reveal(container, 1);
        } else {
	    showPage(page + 1);
        }
    }
}

function reveal(element, n) {
    if (element.classList.contains("hidden")) {
        if (element.classList.contains("later")) {
            --n;
        }
        if (n == 0) {
            element.classList.toggle("hidden");
        }
    }
    if (n < 0) return n;
    for (child of element.children) {
        n = reveal(child, n);
        if (n < 0) return n;
    }
    return n;
}

function countHidden(e) {
    let n = 0;
    if (e.classList.contains("later")) {
        n = 1;
    }
    for (child of e.children) {
        n += countHidden(child);
    }
    return n;
}

function showPage(i) {
    if (i >= 0 && i < slides.childElementCount) {
        const number_of_pages = slides.childElementCount - 1; // -1 since page starts at 0
        page = i;
        window.location.hash = `#${page}`;
        container.innerHTML =
            `<div class="${slides.children[i].classList}">` +
                slides.children[i].innerHTML +
                `<div class="pagenum">${page}/${number_of_pages}</div>` +
            `</div>`;
        revealed = 0;
        hidden = countHidden(container);
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
function swipeDetect(touchsurface, callback){
    const threshold = 150;   // required min distance traveled to be considered swipe
    const allowedTime = 300; // maximum time allowed to travel that distance
    let swipedir, startX, startTime;

    touchsurface.addEventListener('touchstart', e => {
        const touchobj = e.changedTouches[0];
        swipedir = undefined;
        startX = touchobj.pageX;
        startTime = new Date().getTime();
        e.preventDefault();
    }, false);

    touchsurface.addEventListener('touchmove', e => {
        e.preventDefault(); // prevent scrolling when inside DIV
    }, false);

    touchsurface.addEventListener('touchend', e => {
        const touchobj = e.changedTouches[0];
        const distX = touchobj.pageX - startX;
        const elapsedTime = new Date().getTime() - startTime;
        if (elapsedTime <= allowedTime && Math.abs(distX) >= threshold) {
            swipedir = (distX < 0)? 'left' : 'right';
        }
        callback(swipedir);
        e.preventDefault();
    }, false);
}

// keep font size constant relative to container
function calcFont() {
    const fontWidth = 2 * container.clientWidth/window.innerWidth;
    return `${fontWidth}vw`;
}

function onResize() {
    container.style.fontSize = calcFont();
}

// set swipe detection for touch screens
swipeDetect(document.querySelector('body'), swipedir => {
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

showPage(page);
