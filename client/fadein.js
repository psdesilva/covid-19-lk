let opacity = 0;
let intervalID = 0;

function fadeIn (element) {
    intervalID = setInterval(show(element), 20);
}

function show (element) {
    let fadeInElement = document.querySelector(`${element}`);
    opacity = Number(window.getComputedStyle(fadeInElement).getPropertyValue("opacity"));
    if(opacity<1) {
        opacity = opacity+0.1
        fadeInElement.style.opacity = opacity;
    } else {
        clearInterval(intervalID);
    }
}

export { fadeIn };