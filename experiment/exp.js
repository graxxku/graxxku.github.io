const SERVER_URL = "https://graxxku.github.io/";

CLASSES = {
    0: "Pneuomonia (Bacterial)",
    1: "Normal (No Pneuomonia)",
    2: "Pneuomonia (Viral)",
  };
  

  let model;
  (async function () {
    model = await tf.loadModel(`${SERVER_URL}/experiment/model.json`,false); // load the model using tensorflow.js
  })();


async function predict() {
    console.log("tes");

}