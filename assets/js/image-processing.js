// model is trained on 224x224 images, change with caution
const IMAGE_SIZE = 224;

// Create a global temporary canvas
const tempCanvas = new OffscreenCanvas(IMAGE_SIZE, IMAGE_SIZE);
const tempCanvasCtx = tempCanvas.getContext('2d');

export function processCanvas(rectangle, CAMERA_HEIGHT, CAMERA_WIDTH, handsCanvas, handsCanvasCtx, webcam) {
  setCanvasDimensions(rectangle, CAMERA_HEIGHT, CAMERA_WIDTH, handsCanvas);

  // draw webcam image to handsCanvas
  drawWebcamImageToCanvas(rectangle, CAMERA_HEIGHT, CAMERA_WIDTH, handsCanvas, handsCanvasCtx, webcam);

  resizeAndDrawCanvas(handsCanvas, handsCanvasCtx, IMAGE_SIZE, IMAGE_SIZE);

  grayscaleCanvas(handsCanvas, handsCanvasCtx);
};

function drawWebcamImageToCanvas(rectangle, CAMERA_HEIGHT, CAMERA_WIDTH, handsCanvas, handsCanvasCtx, webcam) {
  handsCanvasCtx.drawImage(
    webcam.canvas,
    rectangle.minX * CAMERA_WIDTH,
    rectangle.minY * CAMERA_HEIGHT,
    (rectangle.maxX - rectangle.minX) * CAMERA_WIDTH,
    (rectangle.maxY - rectangle.minY) * CAMERA_HEIGHT,
    0,
    0,
    handsCanvas.width,
    handsCanvas.height
  );
};

function setCanvasDimensions(rectangle, CAMERA_HEIGHT, CAMERA_WIDTH, handsCanvas) {
  handsCanvas.width = (rectangle.maxX - rectangle.minX) * CAMERA_WIDTH;
  handsCanvas.height = (rectangle.maxY - rectangle.minY) * CAMERA_HEIGHT;
};

function resizeAndDrawCanvas(handsCanvas, handsCanvasCtx, targetWidth, targetHeight) {
  tempCanvas.width = targetWidth;
  tempCanvas.height = targetHeight;
  tempCanvasCtx.drawImage(handsCanvas, 0, 0, targetWidth, targetHeight);
  handsCanvas.width = targetWidth;
  handsCanvas.height = targetHeight;
  handsCanvasCtx.drawImage(tempCanvas, 0, 0);
};

function grayscaleCanvas(handsCanvas, handsCanvasCtx) {
  const imageData = handsCanvasCtx.getImageData(0, 0, handsCanvas.width, handsCanvas.height);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
    data[i] = data[i + 1] = data[i + 2] = avg;
  }
  handsCanvasCtx.putImageData(imageData, 0, 0);
};
