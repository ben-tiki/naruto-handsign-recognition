// VARIABLE DECLARATIONS
// ----------------------------------------
let predictions = [];
export let threshold = 5;
let predictionCounter = 0;
let previousPrediction;
let jutsus;

// Media paths
const JUTSUS_JSON_PATH = 'assets/jutsus.json';
const JUTSU_AUDIO_PATH = 'assets/audio/jutsu.mp3';


// EXPORTS
// ----------------------------------------
/**
 * Function to load the hand combinations from the jutsus.json file
 */
export async function loadJutsus() {
  try {
    const response = await fetch(JUTSUS_JSON_PATH);
    const data = await response.json();
    jutsus = data;
    return jutsus;
  } catch (error) {
    console.error('Error fetching jutsus:', error);
  }
};

/**
 * Function to manage the predictions from the Teachable Machine model
 * Checks if the prediction is the same as the previous one to make sure it's not a duplicate
 * Adds a threshold to slow down the predictions, to wait for hand movement to be completed 
 */
export function manageJutsuPrediction(finalPrediction, labelContainer, loadingCircle, pastLabels, jutsusContainer) {
  if (finalPrediction === previousPrediction) {
    predictionCounter++;
    if (predictionCounter >= threshold && predictions[predictions.length - 1] !== finalPrediction) {
      predictions.push(finalPrediction);
      labelContainer.innerHTML = finalPrediction;
      checkJutsuMatch(jutsusContainer, labelContainer, loadingCircle, pastLabels);
    }
  } else {
    predictionCounter = 0;
    previousPrediction = finalPrediction;
  }
};

/**
 * Function to reset the predictions and UI components when no hands are detected
 */
export function resetPredictions(labelContainer, loadingCircle, pastLabels) {
  predictions = [];
  predictionCounter = 0;
  previousPrediction = undefined;

  // UI components
  labelContainer.innerHTML = '';
  loadingCircle.style.backgroundImage = 'none';
  pastLabels.innerHTML = '';
};

/**
 * Function to update the loading circle UI component, which shows the progress of the prediction
 */
export function updateLoadingCircle(loadingCircle) {
  const progress = (predictionCounter / threshold) * 360;

  const emptyColor = '#fffdf1';
  loadingCircle.style.backgroundImage = `conic-gradient(${emptyColor} ${progress}deg, transparent ${progress}deg)`;
  loadingCircle.style.width = loadingCircle.offsetHeight + 'px';
};

/**
 * Function to update the past labels UI component, which shows the previous predictions
 */
export function updatePastLabels(pastLabels) {
  pastLabels.innerHTML = '';
  predictions.forEach(prediction => {
    if (prediction !== 'Nothing') {
      const label = document.createElement('div');
      label.innerHTML = prediction;
      pastLabels.appendChild(label);
    }
  });
};

/**
 * Function to write the jutsu combinations from the jutsus.json file into the modal
 */
export function writeJutsusIntoModal(jutsus, modalBody) {
  const jutsuKeys = Object.keys(jutsus);

  jutsuKeys.forEach(jutsu => {
    const jutsuElement = document.createElement('p');
    jutsuElement.innerHTML = `<strong>${jutsu}:</strong> <em>${jutsus[jutsu].join(', ')}</em>`;
    modalBody.appendChild(jutsuElement);
  });
};

/**
 * Function to set the threshold value of the predictions
 */
export function setThreshold(value) {
  threshold = value;
};

// HELPER FUNCTIONS
// ----------------------------------------
/**
 * Function to check if the current predictions match any of the jutsu combinations in the jutsus.json file
 */
function checkJutsuMatch(jutsusContainer, labelContainer, loadingCircle, pastLabels) {
  const jutsuKeys = Object.keys(jutsus);

  const matchedJutsu = jutsuKeys.find(jutsu => {
    if (predictions.length === jutsus[jutsu].length) {
      return jutsus[jutsu].every((value, index) => value === predictions[index]);
    }
    return false;
  });

  if (matchedJutsu) {
    playJutsuSound();
    showJutsuName(matchedJutsu, jutsusContainer, labelContainer, loadingCircle, pastLabels);
  }
};


/**
 * Function to play the jutsu sound when a jutsu is matched
 */
function playJutsuSound() {
  const audio = new Audio(JUTSU_AUDIO_PATH);
  audio.play();
};

/**
 * Function to show the jutsu name when a jutsu is matched and apply effect to UI components
 */
function showJutsuName(jutsuName, jutsusContainer, labelContainer, loadingCircle, pastLabels) {

  const effectDuration = 3000;

  jutsusContainer.innerHTML = jutsuName;
  jutsusContainer.style.visibility = 'visible';

  labelContainer.style.visibility = 'hidden';
  loadingCircle.style.visibility = 'hidden';
  pastLabels.style.visibility = 'hidden';

  setTimeout(() => {
    jutsusContainer.innerHTML = '';
    jutsusContainer.style.visibility = 'hidden';
    labelContainer.style.visibility = 'visible';
    loadingCircle.style.visibility = 'visible';
    pastLabels.style.visibility = 'visible';
  }, effectDuration);
};