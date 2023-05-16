// load the model and metadata from URL
const teachableMachineURL = '/assets/models/teachable-machine/';
let teachablemachineModel;
let maxPredictions;

export async function loadTeachableMachineModel() {
  const modelURL = teachableMachineURL + 'model.json';
  const metadataURL = teachableMachineURL + 'metadata.json';

  teachablemachineModel = await tmImage.load(modelURL, metadataURL);
  maxPredictions = teachablemachineModel.getTotalClasses();
  return maxPredictions;
};

export async function predictTeachableMachineModel(croppedCanvas) {
  return teachablemachineModel
    .predict(croppedCanvas)
    .then((predictions) => {
      
      // get the highest probability prediction
      const maxProbabilityIndex = getHighestProbability(predictions);

      // get the label of max probability
      const highestProbabilityLabel = predictions[maxProbabilityIndex].className;

      return highestProbabilityLabel;
    })
    .catch((error) => {
      console.error('Error predicting from teachable machine model:', error);
    });
};

function getHighestProbability(predictions) {
  let maxProbability = 0;
  let maxProbabilityIndex = 0;
  for (let i = 0; i < maxPredictions; i++) {
    if (predictions[i].probability > maxProbability) {
      maxProbability = predictions[i].probability;
      maxProbabilityIndex = i;
    }
  }
  return maxProbabilityIndex;
};