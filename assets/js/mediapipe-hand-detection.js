import { HandLandmarker, FilesetResolver } from 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest';

// model configuration
const MIN_HAND_DETECTION_CONFIDENCE = 1.0;
const MIN_HAND_PRESENCE_CONFIDENCE = 1.0;
const MIN_TRACKING_CONFIDENCE = 1.0;

// number of hands to detect
const NUM_HANDS = 2;

// bounding box configuration
const BOUNDING_BOX_COLOR = '#0000FF';
const BOUNDING_BOX_PADDING = 0.025;
const ONE_HAND_AMPLIFICATION_FACTOR = 2;

// hand detection model initialization
let handLandmarker = undefined;

export async function createHandLandmarker() {
  const vision = await FilesetResolver.forVisionTasks(
    'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
  );
  handLandmarker = await HandLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: '/assets/models/mediapipe/hand_landmarker.task',
  
    },
    runningMode: 'VIDEO',
    numHands: NUM_HANDS,
    min_hand_detection_confidence: MIN_HAND_DETECTION_CONFIDENCE,
    min_hand_presence_confidence: MIN_HAND_PRESENCE_CONFIDENCE,
    min_tracking_confidence: MIN_TRACKING_CONFIDENCE,
  });
};

export function detectHandsForVideo(canvas, startTimeMs) {
  return handLandmarker.detectForVideo(canvas, startTimeMs);
};

// HELPER FUNCTIONS
// returns furthest fingers tip from palm
export function getMinMax(landmarks, results) {
  let minX = Infinity,
    maxX = -Infinity,
    minY = Infinity,
    maxY = -Infinity;

  for (const { x, y } of landmarks) {
    minX = Math.min(minX, x);
    maxX = Math.max(maxX, x);
    minY = Math.min(minY, y);
    maxY = Math.max(maxY, y);
  }

  // set padding for bounding box (each hand has 21 landmarks)
  const padding = results.landmarks.length === 1 ? BOUNDING_BOX_PADDING * ONE_HAND_AMPLIFICATION_FACTOR : BOUNDING_BOX_PADDING;

  return [minX - padding, maxX + padding, minY - padding, maxY + padding];
};

// draws bounding rectangle around hand
export function drawBoundingRectangle(ctx, minX, maxX, minY, maxY, canvasWidth, canvasHeight) {
  ctx.strokeStyle = BOUNDING_BOX_COLOR;
  ctx.lineWidth = 0.25;
  ctx.strokeRect(minX * canvasWidth, minY * canvasHeight, (maxX - minX) * canvasWidth, (maxY - minY) * canvasHeight);
};

// returns true if two rectangles overlap
export function doRectanglesOverlap(rect1, rect2) {
  return rect1.minX < rect2.maxX && rect1.maxX > rect2.minX && rect1.minY < rect2.maxY && rect1.maxY > rect2.minY;
};
