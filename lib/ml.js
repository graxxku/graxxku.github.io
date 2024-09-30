//RF
// const input = [
//   0.63314051, 0.63481993, 0.65012129, 0.66915469, 0.58742303,
//   0.76917335, 0.8016421 , 0.20638179, 0.06381788, 0.39149095,
//   1.0       , 0.91136406, 0.82888599, 0.72830752, 0.60944206,
//   0.57738095, 0.57773109, 0.58228291, 0.87009804, 0.89845938,
//   0.3785014 , 0.17296919, 0.41211485, 0.54376751, 0.73564426,
//   0.30217087, 0.58473389, 0.74789916, 0.88445378, 0.76120448,
//   0.27574942, 0.27594158, 0.29707917, 0.49577248, 0.46867794,
//   0.12432744, 0.07090699, 0.41948501, 0.88239816, 0.40930054,
//   0.21617986, 0.29765565, 0.29400461, 0.2509608 , 0.23981553
// ];
// const prediction = score(input);
// console.log("Prediction:", prediction);

var db;
var request = window.indexedDB.open("MyTestDatabase", 1);
request.onupgradeneeded = (event) => {
    const db = request.result;
    if (!db.objectStoreNames.contains("imu")) {
        db.createObjectStore("imu", { keyPath: "id" });
    }else if (!db.objectStoreNames.contains("analyze")) {
        db.createObjectStore("analyze", { keyPath: "id" });
    }
};
request.onsuccess = function(event) {
  // Do something with request.result!
  db = request.result;
  console.log("opened DB")
};


const sleep = ms => new Promise(res => setTimeout(res, ms));

// Function to convert buffer values to signed 16-bit integers
function toSigned16Bit(high, low) {
    let value = (high << 8) | low;
    if (value >= 0x8000) {
        value = value - 0x10000;
    }
    return value;
}

async function recordData(secondsRecord,dbname) {
    console.log(secondsRecord,dbname);
    
    const secondsRecord = 60;
    const numSamples = 60;
    const samplesPerSet = 12; // 6 values for accelerometer and 6 for gyroscope

    for (let i = 0; i < secondsRecord; i++) {
        const timestamp = Date.now();
        const imu = await ble.readValue();
        const buf = new Uint8Array(imu.buffer);
        const accData = [];
        const gyroData = [];

        for (let j = 0; j < numSamples; j += samplesPerSet) {
            const acc_x = toSigned16Bit(buf[j + 1], buf[j]);
            const acc_y = toSigned16Bit(buf[j + 3], buf[j + 2]);
            const acc_z = toSigned16Bit(buf[j + 5], buf[j + 4]);

            const gyro_x = toSigned16Bit(buf[j + 7], buf[j + 6]);
            const gyro_y = toSigned16Bit(buf[j + 9], buf[j + 8]);
            const gyro_z = toSigned16Bit(buf[j + 11], buf[j + 10]);

            // Store the extracted values
            accData.push({ x: acc_x, y: acc_y, z: acc_z });
            gyroData.push({ x: gyro_x, y: gyro_y, z: gyro_z });
        }

        let temp = { id: timestamp, content: { accelerometer: accData, gyroscope: gyroData } };
        const db = request.result;
        const transaction = db.transaction(dbname, "readwrite");
        const imuStore = transaction.objectStore(dbname);
        imuStore.add(temp);
        //await sleep(1000);
    }
    let utterance = new SpeechSynthesisUtterance("recording done, you can rest dude!");
    speechSynthesis.speak(utterance);
}



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

function speak(words){
    let utterance = new SpeechSynthesisUtterance(words);
    speechSynthesis.speak(utterance);
}


function analyze(){
    speak("Siap2, coba lakukan pukulan golf sampai tanda selesai!");

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



function normalizeArray(arr) {
    const min = Math.min(...arr);
    const max = Math.max(...arr);

    // Normalize each value in the array
    const normalizedArray = arr.map(val => (val - min) / (max - min));

    return normalizedArray;
}
