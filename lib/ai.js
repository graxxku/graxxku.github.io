const SERVER_URL = "https://graxxku.github.io/";

CLASSES = {
    0: "Pneuomonia (Bacterial)",
    1: "Normal (No Pneuomonia)",
    2: "Pneuomonia (Viral)",
  };
  

let model;
(async function () {
  model = await tf.loadModel(`${SERVER_URL}/models/model.json`); // load the model using tensorflow.js
})();


async function predict() {
    let image = undefined; // clear the previous image from memory.
    image = $("#analysis_image").get(0); // get the image from the image tag
  
    // Preprocess the image
    let tensor = tf
      .fromPixels(image)
      .resizeNearestNeighbor([224, 224])
      .toFloat()
      .div(tf.scalar(255.0))
      .expandDims();
  
    // Run prediction
    let prediction = await model.predict(tensor).data();

    console.log(prediction);

}