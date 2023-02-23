// all possible hand signs
const handSignsArray = [
    "Saru",
    "Tatsu",
    "Ne",
    "Tori",
    "Mi",
    "Ushi",
    "Inu",
    "Uma",
    "Tora",
    "I",
    "U",
    "Release",
];

const jutsusArray = {
    "Thunderstorm Jutsu": ["Tatsu", "Tora", "Ne", "Tori"],
    "Tidal Wave Jutsu": ["Uma", "Mi", "Inu", "Tatsu", "Release"],
    "Magma Eruption Jutsu": ["Tora", "Tatsu", "Ne", "Tora"],
    "Sandstorm Jutsu": ["Uma", "U", "Inu", "Saru", "Tori"],
    "Ice Shard Jutsu": ["Tori", "Saru", "Mi", "Tori", "Release"],
    "Tornado Jutsu": ["Ushi", "U", "Inu", "Tatsu", "Tori"],
    "Earth Wall Jutsu": ["Saru", "Ne", "Tatsu", "Ushi", "Tora"],
    "Fog Concealment Jutsu": ["Tori", "Tatsu", "Mi", "Ne", "Uma"],
    "Water Strike Jutsu": ["Tora", "U", "Ne", "Tori", "Saru"],
    "Fire Ball Jutsu": ["Tora", "Tatsu", "Mi", "Tori", "Tora"],
};

// check if user performed a jutsu
function jutsu() {
    for (const prediction of predictions) {
        for (const handSign of handSignsArray) {
            if (prediction === handSign) {
                for (const jutsuKey in jutsusArray) {
                    const jutsuArray = jutsusArray[jutsuKey];
                    const jutsuArrayLength = jutsuArray.length;
                    let jutsuArrayIndex = 0;
                    if (prediction === jutsuArray[0]) {
                        for (let i = predictions.indexOf(prediction); i < predictions.length; i++) {
                            if (predictions[i] === jutsuArray[jutsuArrayIndex]) {
                                jutsuArrayIndex++;
                                if (jutsuArrayIndex === jutsuArrayLength) {
                                    const audio = new Audio("assets/audio/jutsu.mp3");
                                    audio.play();
                                    predictions = [];

                                    // show jutsu name
                                    let jutsusContainer = document.getElementById(
                                        "finished-jutsu-container"
                                    );
                                    jutsusContainer.innerHTML = jutsuKey;
                                    jutsusContainer.style.visibility = "visible";

                                    labelContainer.style.visibility = "hidden";
                                    loadingCircle.style.visibility = "hidden";
                                    pastLabels.style.visibility = "hidden";

                                    setTimeout(() => {
                                        jutsusContainer.innerHTML = "";
                                        jutsusContainer.style.visibility = "hidden";
                                        labelContainer.style.visibility = "visible";
                                        loadingCircle.style.visibility = "visible";
                                        pastLabels.style.visibility = "visible";
                                    }, 3000);

                                    break;
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    if (predictions[predictions.length - 1] === "Nothing") {
        predictions = [];
    }
}

// insert justsu combinations into the modal
const jutsusContainer = document.getElementById("jutsus-container");
for (const jutsuKey in jutsusArray) {
    const jutsuName = jutsusArray[jutsuKey];
    let jutsuNameString = jutsuName.join(" ").replace(/\s/g, "  -  ");
    const jutsuElement = document.createElement("div");
    jutsuElement.innerHTML = `<div id="jutsu-line"><span id="jutsu-name">${jutsuKey}:&nbsp&nbsp&nbsp</span>${jutsuNameString}</div>`;
    jutsusContainer.appendChild(jutsuElement);
}

// if c is pressed, reset predictions
document.addEventListener("keydown", (event) => {
    if (event.key === "c") {
        predictions = [];
    }
});
