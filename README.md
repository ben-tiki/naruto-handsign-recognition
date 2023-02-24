# Hand Gesture Recognition using TensorFlow.js and Teachable Machine
This project uses TensorFlow.js and Google's Teachable Machine to recognize up to 9 unique hand gestures in real-time, allowing users to perform different "jutsu" (techniques) and trigger different events. 

# Demo
https://user-images.githubusercontent.com/101474762/221086680-e21feaae-ec04-4f11-83ef-4acb06119c54.mp4

# Usage
You can try the live demo [here](https://ben-tiki.github.io/naruto-handseal-recognition/) or clone this repository and open the `index.html` file in your browser. Under the "+" button, you can check all supported gesture combinations or jutsu.

# Dataset
The dataset used for this project was created by the me, consisting of 9 classes of hand gestures, each with 900 images taken with a webcam under varying lighting, people, and backgrounds.

### Limitations of the dataset:
The model may not generalize well to new data, which can be improved by increasing the training dataset size and using data augmentation techniques. For best results, position your hands at the center of the circle and keep the background as simple as possible.

# Model 
The model can be found in the `assets/model` folder. 

The paramters used to train the model are as follows:

- Number of epochs: 200
- Batch size: 64
- Learning rate: 0.001

# Gesture Examples
<p align="center">
  <img src="assets/img/handsigns.png" width="600" height="700" alt="Hand Seals"/>
</p>

The 9 hand gestures are from the anime "Naruto", where characters perform hand seals to execute jutsu or special abilities. Each gesture has a unique meaning and significance in the anime.

# Built with
- [TensorFlow.js](https://www.tensorflow.org/js) - A JavaScript library for training and deploying machine learning models in the browser and on Node.js

- [Teachable Machine](https://teachablemachine.withgoogle.com/) - A web tool for training and deploying machine learning models in the browser.
