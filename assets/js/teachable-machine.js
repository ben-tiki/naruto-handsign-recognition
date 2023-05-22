// Specify the base path of the model and metadata
const TEACHABLE_MACHINE_URL = './assets/models/teachable-machine/';
let teachableMachineModel;
let totalModelClasses;

/**
 * Function to load the Teachable Machine Model
 */
export async function loadTeachableMachineModel() {
  try {
    const modelURL = `${TEACHABLE_MACHINE_URL}model.json`;
    const metadataURL = `${TEACHABLE_MACHINE_URL}metadata.json`;

    teachableMachineModel = await tmImage.load(modelURL, metadataURL);
    totalModelClasses = teachableMachineModel.getTotalClasses();

    return totalModelClasses;
  } catch (error) {
    console.error('Error loading the Teachable Machine model:', error);
  }
};

/**
 * Function that predicts the cropped and processed canvas using the Teachable Machine Model
 */
export async function predictTeachableMachineModel(croppedCanvas) {
  try {
    const predictions = await teachableMachineModel.predict(croppedCanvas);
    const highestProbabilityPrediction = getHighestProbabilityPrediction(predictions);

    return highestProbabilityPrediction.className;
  } catch (error) {
    console.error('Error predicting from Teachable Machine model:', error);
  }
};

/**
 * Function to get the prediction with the highest probability
 */
function getHighestProbabilityPrediction(predictions) {
  return predictions.reduce((maxPrediction, currentPrediction) =>
    currentPrediction.probability > maxPrediction.probability ? currentPrediction : maxPrediction
  );
};