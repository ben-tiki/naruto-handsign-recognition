import { threshold, setThreshold } from "./jutsu-manager.js";

const modal = document.getElementById("info-modal");
const btn = document.getElementById("more-info-button");
const span = document.getElementsByClassName("close")[0];

// Event listeners
btn.addEventListener("click", showModal);
span.addEventListener("click", hideModal);
window.addEventListener("click", (event) => {
    if (event.target === modal) {
        hideModal();
    }
});

function showModal() {
    modal.style.display = "block";
};

function hideModal() {
    modal.style.display = "none";
};

// Change delayBetweenPredictions with a slider
const slider = document.getElementById("threshold-slider");
const output = document.getElementById("threshold-value");

initializeSlider();

slider.addEventListener("input", handleSliderInput);

function initializeSlider() {
    slider.value = threshold;
    output.innerHTML = slider.value;
    slider.min = 1;
    slider.max = 100;
};

function handleSliderInput() {
    output.innerHTML = this.value;
    setThreshold(this.value);
};