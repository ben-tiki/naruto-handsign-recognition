// predictions variables
let predictions = [];
export let threshold = 5;
let predictionCounter = 0;
let previousPrediction;
let jutsus;

// media paths
const JUTSUS_JSON_PATH = 'assets/jutsus.json';
const JUTSU_AUDIO_PATH = 'assets/audio/jutsu.mp3';

export async function loadJutsus() {
  try {
    const response = await fetch(JUTSUS_JSON_PATH);
    const data = await response.json();
    jutsus = data;
  } catch (error) {
    console.error('Error fetching jutsus:', error);
  }
};

export function manageJutsuPrediction(finalPrediction, labelContainer, loadingCircle, pastLabels, jutsusContainer) {
  // check if prediction is the same as the previous one, to avoid duplicates
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

export function resetPredictions(labelContainer, loadingCircle, pastLabels) {
  predictions = [];
  predictionCounter = 0;
  previousPrediction = undefined;

  // UI components
  labelContainer.innerHTML = '';
  loadingCircle.style.backgroundImage = 'none';
  pastLabels.innerHTML = '';
};

export function updateLoadingCircle(loadingCircle) {
  // UI components
  const progress = (predictionCounter / threshold) * 360;

  const emptyColor = '#fffdf1';
  loadingCircle.style.backgroundImage = `conic-gradient(${emptyColor} ${progress}deg, transparent ${progress}deg)`;
  loadingCircle.style.width = loadingCircle.offsetHeight + 'px';
};

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

function checkJutsuMatch(jutsusContainer, labelContainer, loadingCircle, pastLabels) {
  const jutsuKeys = Object.keys(jutsus);

  const matchedJutsu = jutsuKeys.find(jutsu => {
    if (predictions.length === jutsus[jutsu].length) {
      return jutsus[jutsu].every((value, index) => value === predictions[index]);
    }
    return false;
  });

  if (matchedJutsu) {
    playSound();
    showJutsuName(matchedJutsu, jutsusContainer, labelContainer, loadingCircle, pastLabels);
  }
};

function playSound() {
  const audio = new Audio(JUTSU_AUDIO_PATH);
  audio.play();
};

function showJutsuName(jutsuName, jutsusContainer, labelContainer, loadingCircle, pastLabels) {
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
  }, 3000);
};

export function setThreshold(value) {
  threshold = value;
};