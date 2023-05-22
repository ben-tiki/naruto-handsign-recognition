import { drawHandLandmarks } from './mediapipe-hand-detection.js';

// CONSTANTS
// ----------------------------------------
// Model is trained on 224x224 images, change with caution
const RESIZED_IMAGE_SIZE = 224;

// Create a global temporary canvas
const tempCanvas = new OffscreenCanvas(RESIZED_IMAGE_SIZE, RESIZED_IMAGE_SIZE);
const tempCanvasCtx = tempCanvas.getContext('2d');

// EXPORTS
// ----------------------------------------
/**
 * Function that processes the canvas for the Teachable Machine model to predict
 * Applies the following transformations:
 * 1. Crops the canvas to the bounding box of the hand
 * 2. Converts the cropped canvas to grayscale
 * 3. Resizes the cropped canvas to 224x224
 * 4. Draws the landmarks on the cropped canvas
 */
export function processCanvas(rectangle, CAMERA_HEIGHT, CAMERA_WIDTH, croppedCanvas, croppedCanvasCtx, webcam, landmarks) {

  // Set canvas dimensions
  setCanvasDimensions(rectangle, CAMERA_HEIGHT, CAMERA_WIDTH, croppedCanvas);

  // Draw webcam image to croppedCanvas
  drawWebcamImageToCanvas(rectangle, CAMERA_HEIGHT, CAMERA_WIDTH, croppedCanvas, croppedCanvasCtx, webcam);

  // Convert to grayscale
  grayscaleCanvas(croppedCanvas, croppedCanvasCtx);

  // Resize to 224x224
  resizeAndDrawCanvas(croppedCanvas, croppedCanvasCtx, RESIZED_IMAGE_SIZE, RESIZED_IMAGE_SIZE);

  // Draw landmarks
  for (let i = 0; i < landmarks.length; i++) {
    drawHandLandmarks(croppedCanvasCtx, landmarks[i], croppedCanvas.width, croppedCanvas.height, rectangle);
  }

};

// HELPER FUNCTIONS
// ----------------------------------------
/**
 * Function that draws the webcam image to the cropped canvas
 */
function drawWebcamImageToCanvas(rectangle, CAMERA_HEIGHT, CAMERA_WIDTH, croppedCanvas, croppedCanvasCtx, webcam) {
  croppedCanvasCtx.drawImage(
    webcam.canvas,
    rectangle.minX * CAMERA_WIDTH,
    rectangle.minY * CAMERA_HEIGHT,
    (rectangle.maxX - rectangle.minX) * CAMERA_WIDTH,
    (rectangle.maxY - rectangle.minY) * CAMERA_HEIGHT,
    0,
    0,
    croppedCanvas.width,
    croppedCanvas.height
  );
};

/**
 * Function that sets the dimensions of the cropped canvas to the bounding box of the hand
 */
function setCanvasDimensions(rectangle, CAMERA_HEIGHT, CAMERA_WIDTH, croppedCanvas) {
  croppedCanvas.width = (rectangle.maxX - rectangle.minX) * CAMERA_WIDTH;
  croppedCanvas.height = (rectangle.maxY - rectangle.minY) * CAMERA_HEIGHT;
};

/**
 * Function that resizes the cropped canvas to the specified dimensions
 * 
 */
function resizeAndDrawCanvas(croppedCanvas, croppedCanvasCtx, targetWidth, targetHeight) {
  tempCanvas.width = targetWidth;
  tempCanvas.height = targetHeight;
  tempCanvasCtx.drawImage(croppedCanvas, 0, 0, targetWidth, targetHeight);
  croppedCanvas.width = targetWidth;
  croppedCanvas.height = targetHeight;
  croppedCanvasCtx.drawImage(tempCanvas, 0, 0);
};

/**
 * Function that converts the cropped canvas to grayscale
 */
function grayscaleCanvas(croppedCanvas, croppedCanvasCtx) {
  const imageData = croppedCanvasCtx.getImageData(0, 0, croppedCanvas.width, croppedCanvas.height);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
    data[i] = data[i + 1] = data[i + 2] = avg;
  }
  croppedCanvasCtx.putImageData(imageData, 0, 0);
};
