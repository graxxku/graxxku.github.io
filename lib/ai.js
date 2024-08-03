const SERVER_URL = "https://graxxku.github.io/";


const demo = [[-4.0698000e-01,  8.4442000e-01, -2.2827000e-01,  1.7974850e+01,
  -4.1519170e+01,  2.3422200e+00],
 [-4.8645000e-01,  8.5559000e-01, -2.1655000e-01,  5.7907100e+00,
   1.1177060e+01,  1.2664800e+00],
 [-4.5984000e-01,  8.7756000e-01, -1.9000000e-01,  4.1199000e-01,
   4.2495700e+00, -2.4108900e+00],
 [-4.8206000e-01,  8.7817000e-01, -1.9141000e-01, -1.8310500e+00,
  -1.2359600e+00,  1.3809200e+00],
 [-5.6079000e-01,  8.8757000e-01, -1.6418000e-01,  5.6915300e+00,
   3.1898500e+01, -1.6784670e+01],
 [-1.2518900e+00,  1.0717200e+00,  4.6075000e-01, -8.0711360e+01,
   7.7247620e+01, -7.7713010e+01],
 [-7.2137000e-01,  5.4401000e-01, -1.5778000e-01, -1.6847992e+02,
   6.3690190e+01, -1.1601257e+02],
 [-8.1519000e-01,  1.9999400e+00,  8.1146000e-01,  2.4999237e+02,
  -2.5000000e+02,  6.3400270e+01],
 [-2.6984000e-01, -1.6888000e-01, -2.9724000e-01, -2.4295044e+02,
  -3.1257630e+01, -4.4097900e+00],
 [-5.8527000e-01,  5.6287000e-01, -4.2822000e-01, -8.9706420e+01,
  -4.3144230e+01,  7.1731570e+01],
 [-7.4158000e-01,  6.8463000e-01, -2.4042000e-01,  2.6618960e+01,
  -4.0489200e+01,  3.3767700e+01],
 [-4.8230000e-01,  1.0271600e+00, -1.6876000e-01,  2.2384640e+01,
  -1.8402100e+01, -4.8988340e+01],
 [-6.5283000e-01,  9.4958000e-01, -5.6640000e-02, -1.9798280e+01,
  -5.1269500e+00, -7.3928800e+00]]

CLASSES = {
    0: "bo",
    1: "bu",
    2: "fo",
    3: "fs",
    4: "fu"
  };
  

  let model;
  (async function () {
    model = await tf.loadModel(`${SERVER_URL}/models/model.json`,false); // load the model using tensorflow.js
  })();


async function predict() {
    result = await model.predict(tf.tensor([demo])).data();
    console.log(result);
}


const vectorDistance = (x, y) =>{
  return Math.sqrt(x.reduce((acc, val, i) => acc + Math.pow(val - y[i], 2), 0));
}


const calculateDistance = (x, y) => {
  x = x.split(',').map(parseFloat);
  y = y.split(',').map(parseFloat);
  acc_x = x.slice(0,15);
  gyro_x = x.slice(15);
  acc_y = y.slice(0,15);
  gyro_y = y.slice(15);
  distance_acc = vectorDistance(acc_x,acc_y);
  distance_gyro = vectorDistance(gyro_x,gyro_y);
  console.log("Distance Acelerometer: "+distance_acc+", Distance Gyro: "+distance_gyro);
}