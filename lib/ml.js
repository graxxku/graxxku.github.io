const X_train = [[0.30461377, 0.09767211, 0.68423303],
       [0.83244264, 0.21233911, 0.18182497],
       [0.16122129, 0.92969765, 0.80812038],
       [0.45606998, 0.78517596, 0.19967378],
       [0.70807258, 0.02058449, 0.96990985],
       [0.43194502, 0.29122914, 0.61185289],
       [0.11005192, 0.22793516, 0.42710779],
       [0.3636296 , 0.97178208, 0.96244729],
       [0.2517823 , 0.49724851, 0.30087831],
       [0.66252228, 0.31171108, 0.52006802],
       [0.51423444, 0.59241457, 0.04645041],
       [0.54671028, 0.18485446, 0.96958463],
       [0.00552212, 0.81546143, 0.70685734],
       [0.31435598, 0.50857069, 0.90756647],
       [0.5612772 , 0.77096718, 0.4937956 ],
       [0.37454012, 0.95071431, 0.73199394],
       [0.11986537, 0.33761517, 0.9429097 ],
       [0.62329813, 0.33089802, 0.06355835],
       [0.10789143, 0.03142919, 0.63641041],
       [0.18340451, 0.30424224, 0.52475643],
       [0.63755747, 0.88721274, 0.47221493],
       [0.94888554, 0.96563203, 0.80839735],
       [0.22879817, 0.07697991, 0.28975145],
       [0.59865848, 0.15601864, 0.15599452],
       [0.35675333, 0.28093451, 0.54269608],
       [0.05808361, 0.86617615, 0.60111501],
       [0.5107473 , 0.417411  , 0.22210781],
       [0.24929223, 0.41038292, 0.75555114],
       [0.98688694, 0.77224477, 0.19871568],
       [0.80744016, 0.8960913 , 0.31800347],
       [0.60754485, 0.17052412, 0.06505159],
       [0.14092422, 0.80219698, 0.07455064],
       [0.59789998, 0.92187424, 0.0884925 ],
       [0.50267902, 0.05147875, 0.27864646],
       [0.38867729, 0.27134903, 0.82873751],
       [0.13949386, 0.29214465, 0.36636184],
       [0.81801477, 0.86073058, 0.00695213],
       [0.03438852, 0.9093204 , 0.25877998],
       [0.31098232, 0.32518332, 0.72960618],
       [0.63340376, 0.87146059, 0.80367208]];

const y_train = [0, 1, 1, 2, 1, 1, 0, 1, 2, 0, 2, 1, 1, 0, 2, 0, 2, 2, 2, 0, 1, 2,
       2, 0, 0, 2, 2, 0, 2, 0, 2, 0, 1, 1, 2, 1, 1, 1, 2, 0];

const X_test = [[0.44015249, 0.12203823, 0.49517691],
       [0.18657006, 0.892559  , 0.53934224],
       [0.11959425, 0.71324479, 0.76078505],
       [0.32320293, 0.51879062, 0.70301896],
       [0.77513282, 0.93949894, 0.89482735],
       [0.28484049, 0.03688695, 0.60956433],
       [0.35846573, 0.11586906, 0.86310343],
       [0.72900717, 0.77127035, 0.07404465],
       [0.52273283, 0.42754102, 0.02541913],
       [0.19598286, 0.04522729, 0.32533033]];

const y_test = [2, 2, 2, 1, 1, 2, 2, 0, 2, 2];


const options = {
  seed: 3,
  maxFeatures: 0.8,
  replacement: true,
  nEstimators: 25
};

const clf = new ML.RandomForestClassifier(options);
clf.train(X_train, y_train);
const result = clf.predict(X_test);

function normalizeArray(arr) {
    const min = Math.min(...arr);
    const max = Math.max(...arr);

    // Normalize each value in the array
    const normalizedArray = arr.map(val => (val - min) / (max - min));

    return normalizedArray;
}



var db;
var request = window.indexedDB.open("MyTestDatabase", 1);
request.onupgradeneeded = (event) => {
    const db = request.result;
    if (!db.objectStoreNames.contains("imu")) {
        db.createObjectStore("imu", { keyPath: "id" });
    }
};
request.onsuccess = function(event) {
  // Do something with request.result!
  db = request.result;
  console.log("opened DB")
};


function pullData(){
    var output;
    var transaction = db.transaction("imu", "readwrite");
    var objectStore = transaction.objectStore("imu");
    var getAllData = objectStore.getAll();
    getAllData.onsuccess = function() {
        output = getAllData.result;
    };
    return output;
}


function pullTransformData() {
    
    const allData = pullData();

    let accel_x =[];
    let accel_y =[];
    let accel_z =[];

    for(let i=0; i<60; i++){
        let accel = allData[i].content.accelerometer;
        for(let j=0; j<5; j++){
            accel_x.push(accel[j].x);
            accel_y.push(accel[j].y);
            accel_z.push(accel[j].z);
        }
    }

    accel_x = normalizeArray(accel_x);
    accel_y = normalizeArray(accel_y);
    accel_z = normalizeArray(accel_z);
    
}
