import { threshold, setThreshold } from "./jutsu-manager.js";

// CONSTANTS
// ----------------------------------------
const minThreshold = 1;
const maxThreshold = 100;

// DOM elements
// ----------------------------------------
const moreInfoModal = document.getElementById("info-modal");
const moreInfoButton = document.getElementById("more-info-button");
const modalCloseButton = document.getElementsByClassName("close")[0];
const thresholdSlider = document.getElementById("threshold-slider");
const thresholdValue = document.getElementById("threshold-value")

export const jutsuCombinationsSpan = document.getElementById("jutsu-combinations");

// FUNCTIONS
// ----------------------------------------
function showModal() {
    moreInfoModal.style.display = "block";
};

function hideModal() {
    moreInfoModal.style.display = "none";
};

function initializeSlider() {
    thresholdSlider.value = threshold;
    thresholdValue.innerHTML = thresholdSlider.value;
    thresholdSlider.min = minThreshold;
    thresholdSlider.max = maxThreshold;
};

function handleSliderInput() {
    thresholdValue.innerHTML = this.value;
    setThreshold(this.value);
};

/// EVENT LISTENERS
// ----------------------------------------
moreInfoButton.addEventListener("click", showModal);
modalCloseButton.addEventListener("click", hideModal);
window.addEventListener("click", (event) => {
    if (event.target === moreInfoModal) {
        hideModal();
    }
});
thresholdSlider.addEventListener("input", handleSliderInput);

// INITIALIZATION
// ----------------------------------------
initializeSlider();