// IMPORTS
// ----------------------------------------
import {
  createHandLandmarker,
  detectHandsForVideo,
  calculateHandBoundingBox,
  drawHandBoundingBox,
  doRectanglesOverlap,
} from './mediapipe-hand-detection.js';

import { loadTeachableMachineModel, predictTeachableMachineModel } from './teachable-machine.js';

import { processCanvas } from './image-processing.js';

import { loadJutsus, manageJutsuPrediction, updateLoadingCircle, updatePastLabels, resetPredictions, writeJutsusIntoModal } from './jutsu-manager.js';

import { jutsuCombinationsSpan } from './modal.js';

// VARIABLE DECLARATIONS
// ----------------------------------------
let webcam;
let totalModelClasses;

// Select canvas elements
const boxDrawingCanvas = document.getElementById('image-canvas');
const boxDrawingCanvasCtx = boxDrawingCanvas.getContext('2d');

const processedCanvas = document.getElementById('processed-canvas');
const processedCanvasCtx = processedCanvas.getContext('2d', { willReadFrequently: true });

// Label container
const labelContainer = document.getElementById('label-container');
const loadingCircle = document.getElementById('loading-circle');
const pastLabels = document.getElementById('past-labels');
const finishedJutsuContainer = document.getElementById('finished-jutsu-container');

const webcamContainer = document.getElementById('webcam-container');

// Constants
const CAMERA_WIDTH = 400;
const CAMERA_HEIGHT = 400;
const DRAW_BOUNDING_BOX = false;

// INITIALIZATION
// ----------------------------------------
/**
 * Function that initializes the application
 */
async function init() {
  try {
    // Load MediaPipe hand detection model
    await createHandLandmarker();

    // Load Teachable Machine model
    totalModelClasses = await loadTeachableMachineModel();
  } catch (error) {
    console.error('Error initializing:', error);
    return;
  }

  await startWebcam();

  // Start loop
  window.requestAnimationFrame(loop);

  const jutsus = await loadJutsus();

  initializeUI();

  writeJutsusIntoModal(jutsus, jutsuCombinationsSpan);

};

// MAIN LOOP
// ----------------------------------------
/**
 * Function that loops the webcam input and prediction functions
 */
async function loop() {
  webcam.update();
  await predict();
  window.requestAnimationFrame(loop);
};

// PREDICT VIDEO INPUT
// ----------------------------------------
/**
 * Function that predicts the video input
 * Detects hands, gets bounding boxes, processes canvas, predicts with Teachable Machine model
 * Updates UI components
 */
async function predict() {
  // Predict hands
  const startTimeMs = performance.now();
  const results = detectHandsForVideo(webcam.canvas, startTimeMs);

  // Get bounding boxes from hand landmarks
  const rectangles = results.landmarks.map((landmarks) => {
    const [minX, maxX, minY, maxY] = calculateHandBoundingBox(landmarks, results);
    return { minX, maxX, minY, maxY };
  });

  // Clear canvas
  if (DRAW_BOUNDING_BOX) {
    boxDrawingCanvasCtx.clearRect(0, 0, boxDrawingCanvas.width, boxDrawingCanvas.height);
  }

  processedCanvasCtx.clearRect(0, 0, processedCanvas.width, processedCanvas.height);

  // Manage TM model based on hands
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
      await handlePrediction(targetRectangle, results.landmarks);
    }
  }
};

/**
 * Function that handles the prediction if there is a hand detected
 * Draws bounding box, processes canvas, predicts with Teachable Machine model
 * Updates UI components
 */
async function handlePrediction(rectangle, landmarks) {
  if (DRAW_BOUNDING_BOX) {
    drawHandBoundingBox(
      boxDrawingCanvas,
      boxDrawingCanvasCtx,
      rectangle
    );
  }

  processCanvas(rectangle, CAMERA_HEIGHT, CAMERA_WIDTH, processedCanvas, processedCanvasCtx, webcam, landmarks);

  // Get prediction
  const prediction = await predictTeachableMachineModel(processedCanvas);

  manageJutsuPrediction(prediction, labelContainer, loadingCircle, pastLabels, finishedJutsuContainer);

  updateLoadingCircle(loadingCircle);

  updatePastLabels(pastLabels, prediction, totalModelClasses);

  // Show prediction
  labelContainer.innerHTML = prediction;
};

// HELPERS
// ----------------------------------------
/**
 * Function to start the input webcam stream
 */
async function startWebcam() {
  const flip = true;
  webcam = new tmImage.Webcam(CAMERA_WIDTH, CAMERA_HEIGHT, flip);
  await webcam.setup();
  await webcam.play();
};

/**
 * Make webcam and loading circle visible
 */
function initializeUI() {
  // Append elements to DOM
  webcamContainer.appendChild(webcam.canvas);
  webcamContainer.style.opacity = 1;

  // Set UI elements
  loadingCircle.style.height = CAMERA_HEIGHT * 1.05 + 'px';
  boxDrawingCanvas.style.height = CAMERA_HEIGHT + 'px';
  boxDrawingCanvas.style.width = CAMERA_WIDTH + 'px';
};

// START
// ----------------------------------------
init();