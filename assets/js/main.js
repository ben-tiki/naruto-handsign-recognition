// IMPORTS
// ----------------------------------------
import {
  createHandLandmarker,
  detectHandsForVideo,
  getMinMax,
  drawBoundingRectangle,
  doRectanglesOverlap,
} from './mediapipe-hand-detection.js';

import { loadTeachableMachineModel, predictTeachableMachineModel } from './teachable-machine.js';

import { processCanvas } from './image-processing.js';

import { loadJutsus, manageJutsuPrediction, updateLoadingCircle, updatePastLabels, resetPredictions } from './jutsu-manager.js';

// INITIALIZATION
// ----------------------------------------
let webcam;
let maxPredictions;

// select canvas element
const boxDrawingCanvas = document.getElementById('image-canvas');
const boxDrawingCanvasCtx = boxDrawingCanvas.getContext('2d');

const processedCanvas = document.getElementById('processed-canvas');
const processedCanvasCtx = processedCanvas.getContext('2d', { willReadFrequently: true });

// label container
const labelContainer = document.getElementById('label-container');
const loadingCircle = document.getElementById('loading-circle');
const pastLabels = document.getElementById('past-labels');
const finishedJutsuContainer = document.getElementById('finished-jutsu-container');

// constants
const CAMERA_WIDTH = 400;
const CAMERA_HEIGHT = 400;
const DRAW_BOUNDING_BOX = false;

async function init() {
  try {
    // load hand detection model
    await createHandLandmarker();
  } catch (error) {
    console.error('Error loading hand detection model:', error);
    return;
  }

  try {
    // load teachable machine model
    maxPredictions = await loadTeachableMachineModel();
  } catch (error) {
    console.error('Error loading teachable machine model:', error);
    return;
  }

  // start webcam
  const flip = true;
  webcam = new tmImage.Webcam(CAMERA_WIDTH, CAMERA_HEIGHT, flip);
  await webcam.setup();
  await webcam.play();

  // start loop
  window.requestAnimationFrame(loop);

  // load jutsus
  await loadJutsus();

  // append elements to DOM
  let webcamContainer = document.getElementById('webcam-container');
  webcamContainer.appendChild(webcam.canvas);
  webcamContainer.style.opacity = 1;

  // set UI elements
  loadingCircle.style.height = CAMERA_HEIGHT * 1.05 + 'px';
  boxDrawingCanvas.style.height = CAMERA_HEIGHT + 'px';
  boxDrawingCanvas.style.width = CAMERA_WIDTH + 'px';
};

// MAIN LOOP
// ----------------------------------------
async function loop() {
  webcam.update();
  await predict();
  window.requestAnimationFrame(loop);
};

// PREDICT VIDEO INPUT
// ----------------------------------------
async function predict() {
  // predict hands
  const startTimeMs = performance.now();
  const results = detectHandsForVideo(webcam.canvas, startTimeMs);

  // get bounding boxes from hand landmarks
  const rectangles = results.landmarks.map((landmarks) => {
    const [minX, maxX, minY, maxY] = getMinMax(landmarks, results);
    return { minX, maxX, minY, maxY };
  });

  // clear canvas
  if (DRAW_BOUNDING_BOX) {
    boxDrawingCanvasCtx.clearRect(0, 0, boxDrawingCanvas.width, boxDrawingCanvas.height);
  }

  processedCanvasCtx.clearRect(0, 0, processedCanvas.width, processedCanvas.height);

  // manage TM model based on hands
  if (results.landmarks.length === 0) {

    resetPredictions(labelContainer, loadingCircle, pastLabels);
    
  } else {
    let targetRectangle;

    if (results.landmarks.length === 1) {
      targetRectangle = rectangles[0];
    } else if (results.landmarks.length === 2 && doRectanglesOverlap(rectangles[0], rectangles[1])) {
      targetRectangle = {
        minX: Math.min(rectangles[0].minX, rectangles[1].minX),
        maxX: Math.max(rectangles[0].maxX, rectangles[1].maxX),
        minY: Math.min(rectangles[0].minY, rectangles[1].minY),
        maxY: Math.max(rectangles[0].maxY, rectangles[1].maxY),
      };
    }

    if (targetRectangle) {
      await handlePrediction(targetRectangle);
    }
  }
};

async function handlePrediction(rectangle) {
  // draw bounding rectangle around hand(s)
  if (DRAW_BOUNDING_BOX) {
    drawBoundingRectangle(
      boxDrawingCanvasCtx,
      rectangle.minX,
      rectangle.maxX,
      rectangle.minY,
      rectangle.maxY,
      boxDrawingCanvas.width,
      boxDrawingCanvas.height
    );
  }

  // process canvas
  processCanvas(rectangle, CAMERA_HEIGHT, CAMERA_WIDTH, processedCanvas, processedCanvasCtx, webcam);

  // get prediction
  const prediction = await predictTeachableMachineModel(processedCanvas);

  // manage prediction
  manageJutsuPrediction(prediction, labelContainer, loadingCircle, pastLabels, finishedJutsuContainer);

  // update loading circle
  updateLoadingCircle(loadingCircle);

  // past labels
  updatePastLabels(pastLabels, prediction, maxPredictions);

  // show prediction
  labelContainer.innerHTML = prediction;
};

// START
// ----------------------------------------
init();