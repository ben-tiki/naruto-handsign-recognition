// IMPORTS
// ----------------------------------------
import { HandLandmarker, FilesetResolver } from 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest';

// CONSTANTS
// ----------------------------------------
const MEDIAPIPE_BASE_URL = './assets/models/mediapipe/hand_landmarker.task';

// Model configuration
const MIN_HAND_DETECTION_CONFIDENCE = 0.5;
const MIN_HAND_PRESENCE_CONFIDENCE = 0.5;
const MIN_TRACKING_CONFIDENCE = 0.5;

// Number of hands to detect
const NUM_HANDS = 2;

// Bounding box configuration
const BOUNDING_BOX_COLOR = 'blue';
const BOUNDING_BOX_PADDING = 0.025;
const ONE_HAND_AMPLIFICATION_FACTOR = 2;

// Hand detection model initialization
let handLandmarker = undefined;

// EXPORTS
// ----------------------------------------
/**
 * Function that loads the HandLandmarker model for hand detection and tracking
 */
export async function createHandLandmarker() {
  try {
    const vision = await FilesetResolver.forVisionTasks('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm');
    handLandmarker = await HandLandmarker.createFromOptions(vision, {
      baseOptions: { modelAssetPath: MEDIAPIPE_BASE_URL },
      runningMode: 'VIDEO',
      numHands: NUM_HANDS,
      min_hand_detection_confidence: MIN_HAND_DETECTION_CONFIDENCE,
      min_hand_presence_confidence: MIN_HAND_PRESENCE_CONFIDENCE,
      min_tracking_confidence: MIN_TRACKING_CONFIDENCE,
    });
  } catch (error) {
    console.error("Error in creating HandLandmarker: ", error);
    throw error;
  }
};

/**
 * Function that detects hands in a video input
 */
export function detectHandsForVideo(canvas, startTimeMs) {
  return handLandmarker.detectForVideo(canvas, startTimeMs);
};

// HELPER FUNCTIONS
// ----------------------------------------
/** 
 * Function that calculates the bounding box of a hand
 */
export function calculateHandBoundingBox(landmarks, results) {
  
  let [{ x: minX, y: minY }] = landmarks;
  let maxX = minX, maxY = minY;

  for (const { x, y } of landmarks) {
    minX = Math.min(minX, x);
    maxX = Math.max(maxX, x);
    minY = Math.min(minY, y);
    maxY = Math.max(maxY, y);
  }

  // Set padding for bounding box (each hand has 21 landmarks)
  const padding = results.landmarks.length === 1 ? BOUNDING_BOX_PADDING * ONE_HAND_AMPLIFICATION_FACTOR : BOUNDING_BOX_PADDING;

  return [minX - padding, maxX + padding, minY - padding, maxY + padding];
};

/**
 * Function that draws a bounding box around detected hands into the canvas
 */
export function drawHandBoundingBox(boxDrawingCanvas, ctx, rectangle) {
  ctx.strokeStyle = BOUNDING_BOX_COLOR;
  ctx.lineWidth = 0.25;
  ctx.strokeRect(rectangle.minX * boxDrawingCanvas.width, rectangle.minY * boxDrawingCanvas.height, (rectangle.maxX - rectangle.minX) * boxDrawingCanvas.width, (rectangle.maxY - rectangle.minY) * boxDrawingCanvas.height);
};

/**
 * Function that draws dots on the hands keypoints, and connects them with lines
 * It is drawn into the processed canvas (grayscale, resized, cropped) for the Teachable Machine model
 * The model is trained on fixed colors, and draw sizes. Change with caution
 */
export function drawHandLandmarks(croppedCanvas, landmarks, canvasWidth, canvasHeight, rectangle, pointSize = 2.5, lineWidth = 1, fillColor = "red", strokeColor = "red") {

  const handConnectionPoints = [
    [0, 1], [1, 2], [2, 3], [3, 4], // Thumb
    [0, 5], [5, 6], [6, 7], [7, 8], // Index
    [0, 9], [9, 10], [10, 11], [11, 12], // Middle
    [0, 13], [13, 14], [14, 15], [15, 16], // Ring
    [0, 17], [17, 18], [18, 19], [19, 20], // Pinky
    [5, 9], [9, 13], [13, 17], [17, 0] // Palm
  ];

  // Draw landmarks
  for (let i = 0; i < landmarks.length; i++) {
    // Adjust landmarks to the context of the cropped image
    let x = (landmarks[i].x - rectangle.minX) / (rectangle.maxX - rectangle.minX) * canvasWidth;
    let y = (landmarks[i].y - rectangle.minY) / (rectangle.maxY - rectangle.minY) * canvasHeight;

    croppedCanvas.beginPath();
    croppedCanvas.arc(x, y, pointSize, 0, 2 * Math.PI);
    croppedCanvas.fillStyle = fillColor;
    croppedCanvas.fill();
    croppedCanvas.closePath();
  }

  // Draw connections between landmarks
  croppedCanvas.beginPath();
  croppedCanvas.strokeStyle = strokeColor;
  croppedCanvas.lineWidth = lineWidth;

  for (let i = 0; i < handConnectionPoints.length; i++) {
    let start = landmarks[handConnectionPoints[i][0]];
    let end = landmarks[handConnectionPoints[i][1]];

    let startX = (start.x - rectangle.minX) / (rectangle.maxX - rectangle.minX) * canvasWidth;
    let startY = (start.y - rectangle.minY) / (rectangle.maxY - rectangle.minY) * canvasHeight;
    let endX = (end.x - rectangle.minX) / (rectangle.maxX - rectangle.minX) * canvasWidth;
    let endY = (end.y - rectangle.minY) / (rectangle.maxY - rectangle.minY) * canvasHeight;

    croppedCanvas.moveTo(startX, startY);
    croppedCanvas.lineTo(endX, endY);
  }

  croppedCanvas.stroke();
  croppedCanvas.closePath();
};


/**
 * Function that checks if two rectangles (hand bounding boxes) overlap
 */
export function doRectanglesOverlap(rect1, rect2) {
  return rect1.minX < rect2.maxX && rect1.maxX > rect2.minX && rect1.minY < rect2.maxY && rect1.maxY > rect2.minY;
};
