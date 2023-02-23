let modal = document.getElementById("info-modal");
let btn = document.getElementById("more-info-button");
let span = document.getElementsByClassName("close")[0];

// event listeners
btn.onclick = function () {
    modal.style.display = "block";
};
span.onclick = function () {
    modal.style.display = "none";
};
window.onclick = function (event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
};

// change delayBetweenPredictions with a slider
let slider = document.getElementById("threshold-slider");
let output = document.getElementById("threshold-value");


slider.value = threshold;
output.innerHTML = slider.value;
slider.min = 1;
slider.max = 100;

slider.oninput = function () {
    output.innerHTML = this.value;
    threshold = this.value;
}