// const options = {
//   seed: 3,
//   maxFeatures: 0.8,
//   replacement: true,
//   nEstimators: 25
// };

// const clf = new ML.RandomForestClassifier(options);
// clf.train(X_train, y_train);
// const result = clf.predict(X_test);

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


function pullData() {
    return new Promise((resolve, reject) => {
        var transaction = db.transaction("imu", "readwrite");
        var objectStore = transaction.objectStore("imu");
        var getAllData = objectStore.getAll();
        
        getAllData.onsuccess = function(event) {
            resolve(event.target.result);
        };
        
        getAllData.onerror = function(event) {
            reject(event.target.error);
        };
    });
}


function pullTransformData() {
    let result = pullData().then(data=>{
        let accel_x = [];
        let accel_y = [];
        let accel_z = [];
        for(let i=0; i<data.length; i++){
            let accel = data[i].content.accelerometer;
            for(let j=0; j<5; j++){
                accel_x.push(accel[j].x);
                accel_y.push(accel[j].y);
                accel_z.push(accel[j].z);
            }
        }
        return [accel_x,accel_y,accel_z];
    }).then(data=>{        
        let out_x;
        let out_y;
        let out_z;
        out_x = normalizeArray(data[0]);
        out_y = normalizeArray(data[1]);
        out_z = normalizeArray(data[2]);
        return [out_x,out_y,out_z]
    });
    return result;
}


function feedback(){
    let utterance = new SpeechSynthesisUtterance("posisi pukulan sudah tepat, tenaganya kurang, yok bisa!");
    speechSynthesis.speak(utterance);
}

function calculateAverageForce(data, mass) {
    let forceSum = 0;
    const g = 9.81; // Acceleration due to gravity in m/s^2

    data.forEach(point => {
        const [x, y, z] = point;
        // Calculate the magnitude of acceleration
        const acceleration = Math.sqrt(x * x + y * y + z * z);
        // Calculate the force
        const force = mass * acceleration * g;
        // Accumulate the force
        forceSum += force;
    });

    // Calculate the average force
    const averageForce = forceSum / data.length;
    return averageForce;
}

// Example usage
const data = [
    [0.1, 0.2, 0.3], [0.2, 0.1, 0.4], [0.3, 0.3, 0.2], // ... up to 20 points
    // Add more points as needed
];
const mass = 0.5; // Mass in kg
const averageForce = calculateAverageForce(data, mass);
console.log(`Average Force: ${averageForce.toFixed(2)} N`);
