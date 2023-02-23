// global variables
let model, webcam, labelContainer, loadingCircle, pastLabels, maxPredictions;
const URL = "assets/model/";

// webcam settings
const webCamHeight = 400;
const webCamWidth = 400;

// predictions variables
let predictions = [];
let threshold = 20;
let predictionCounter = 0;
let previousPrediction;

// LOAD MODEL AND SET UP WEBCAM
// ---------------------------------------
async function init() {
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";

    model = await tmImage.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();

    // webcam instance
    const flip = true;
    webcam = new tmImage.Webcam(webCamWidth, webCamHeight, flip);
    await webcam.setup();
    await webcam.play();
    window.requestAnimationFrame(loop);

    // append elements to the DOM
    document.getElementById("webcam-container").appendChild(webcam.canvas);
    labelContainer = document.getElementById("label-container");

}

// MAKE PREDICTIONS
// ---------------------------------------
async function predict() {
    const prediction = await model.predict(webcam.canvas);

    // find the prediction with the highest probability
    let maxProbability = 0;
    let maxProbabilityIndex = 0;
    for (let i = 0; i < maxPredictions; i++) {
        if (prediction[i].probability > maxProbability) {
            maxProbability = prediction[i].probability;
            maxProbabilityIndex = i;
        }
    }

    // prediction is finalized when it is the same for "threshold" number of times
    let finalPrediction = prediction[maxProbabilityIndex].className;
    if (finalPrediction === previousPrediction) {
        predictionCounter++;
        if (predictionCounter >= threshold) {
            labelContainer.innerHTML = finalPrediction;

            // if previous prediction is different, then add to predictions array
            // avoid adding the same prediction multiple times
            if (predictions[predictions.length - 1] !== finalPrediction) {
                predictions.push(finalPrediction);
            }
        }
    } else {
        predictionCounter = 0;
        previousPrediction = finalPrediction;
    }

    // UI components
    let progress = (predictionCounter / threshold) * 360;
    loadingCircle = document.getElementById("loading-circle");

    let emptyColor = "#fffdf1";
    loadingCircle.style.backgroundImage = `conic-gradient(${emptyColor} ${progress}deg, transparent ${progress}deg)`;
    loadingCircle.style.width = loadingCircle.offsetHeight + "px";

    pastLabels = document.getElementById("past-labels");
    pastLabels.innerHTML = "";
    for (let i = 0; i < predictions.length; i++) {
        if (predictions[i] != "Nothing") {
            let label = document.createElement("div");
            label.innerHTML = predictions[i];
            pastLabels.appendChild(label);
        }
    }
}

// UPDATE AND LOOP
// ---------------------------------------
async function loop() {
    webcam.update();
    await predict();
    jutsu();
    window.requestAnimationFrame(loop);
}