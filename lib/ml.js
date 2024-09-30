'use strict';

//animation
var G_A, G_B, G_C;

var db;
var request = window.indexedDB.open("MyTestDatabase", 1);
request.onupgradeneeded = (event) => {
    const db = request.result;
    if (!db.objectStoreNames.contains("imu")) {
        db.createObjectStore("imu", { keyPath: "id" });
    }
    if (!db.objectStoreNames.contains("analyze")) {
        db.createObjectStore("analyze", { keyPath: "id" });
    }
};
request.onsuccess = function(event) {
  // Do something with request.result!
  db = request.result;
  console.log("opened DB")
};


let ble = null;
let bleDevice = null;
let shouldConnect = true;

function onConnected() {
    document.querySelector('.toggleble').textContent = "Disconnect";
    shouldConnect = false;
}

function onDisconnected() {
    document.querySelector('.toggleble').textContent = "Connect";
    shouldConnect = true;
    
}

function toggleBle() {
    if(shouldConnect){
        navigator.bluetooth.requestDevice(
            {
                acceptAllDevices:true,
                optionalServices: ['07af27a5-9c22-11ea-9afe-02fcdc4e7412','07af27a6-9c22-11ea-9afe-02fcdc4e7412']
            })
            .then(device => {
                device.addEventListener('gattserverdisconnected', onDisconnected)
                bleDevice = device;
                return device.gatt.connect();
            })
            .then(server => {
                return server.getPrimaryService('07af27a5-9c22-11ea-9afe-02fcdc4e7412');
            })
            .then(service => {
                return service.getCharacteristic('07af27a6-9c22-11ea-9afe-02fcdc4e7412');
            })
            .then(characteristic => {
                ble = characteristic;
                onConnected();
            })
            .catch(error => {
                console.log('Argh! ' + error);
        });
    }else{
        bleDevice.gatt.disconnect();
    }    
}

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
    const numSamples = 60;
    const samplesPerSet = 12; // 6 values for accelerometer and 6 for gyroscope

    for (let i = 0; i < secondsRecord; i++) {
        const timestamp = Date.now();
        try{
            const imu = await ble.readValue();
        }catch{
            speak("hubungkan dulu dengan perangkat!");
            break
        }
        
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



function pullData(dbname) {
    return new Promise((resolve, reject) => {
        var transaction = db.transaction(dbname, "readwrite");
        var objectStore = transaction.objectStore(dbname);
        var getAllData = objectStore.getAll();
        
        getAllData.onsuccess = function(event) {
            resolve(event.target.result);
        };
        
        getAllData.onerror = function(event) {
            reject(event.target.error);
        };
    });
}


function pullTransformData(dbname) {
    let result = pullData(dbname).then(data=>{
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


async function analyze(){
    deleteContent("MyTestDatabase","analyze");
    speak("Siap siap, coba lakukan pukulan golf");
    await sleep(2000);

    recordData(5,"analyze");
    var result = await pullTransformData("analyze");

    if(checkEmptyArrays(result)){
        return;
    }

    var idx = process2DArray(result);

    console.log(idx);
    

    if(idx === 0){
        G_A = G_0A;
        G_B = G_0B;
        G_C = G_0C;
        speak("posisi anda sudah benar");
    }else if (idx === 1){
        G_A = G_1A;
        G_B = G_1B;
        G_C = G_1C;
        speak("posisi anda under seperti animasi");
    }else if (idx === 2){
        G_A = G_2A;
        G_B = G_2B;
        G_C = G_2C;
        speak("posisi anda over seperti animasi");
    }

    await sleep(2000);

    createScene();
    var man = new Male();
    man.rotation.y = 20;
    man.r_fingers.bend = 45
    var switchposition = false;
    var shouldswitch = false;

    function animate(t)
    {
        var k = THREE.MathUtils.clamp(0.5 + 0.6 * sin(t*speed), 0, 1);

        if(k==1){
            shouldswitch = true;
        }

        if(k==0 && shouldswitch){
            switchposition = !switchposition;
            shouldswitch = false;
        }


        if(switchposition){
            man.posture = Mannequin.blend(G_A, G_C, k);
        }else{
            man.posture = Mannequin.blend(G_A, G_B, k);
        }
    }
    

    // var myDiv = document.getElementById('canvas');
    // if (myDiv.style.display === 'none') {
    //     myDiv.style.display = 'block';
    // } else {
    //     myDiv.style.display = 'none';
    // }
    // onWindowResize();
    

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


function onWindowResize(){
    const container = document.getElementById( 'canvas' );
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.offsetWidth,container.offsetHeight,true);
}

function process2DArray(array) {
    const numRows = array.length;
    const interval = 15;
    const probabilities = Array(numRows).fill(0);
    for (let startCol = 0; startCol <= array[0].length - interval; startCol += interval) {
        for (let row = 0; row < numRows; row++) {
            const chunk = array[row].slice(startCol, startCol + interval);
            const scoreResult = parseFloat(score(chunk)); // Convert string to number
            probabilities[row] += scoreResult;
        }
    }
    // Calculate the average probability for each row by dividing by 3
    const averageProbabilities = probabilities.map(prob => prob / 3);
    // Find the index of the maximum average probability
    const maxIndex = averageProbabilities.indexOf(Math.max(...averageProbabilities));

    return maxIndex;
}

function deleteContent(dbname, storeName) {
    return new Promise((resolve, reject) => {
        let request = indexedDB.open(dbname);

        request.onsuccess = function(event) {
            let db = event.target.result;

            if (!db.objectStoreNames.contains(storeName)) {
                resolve(`Object store "${storeName}" does not exist`);
                return;
            }

            let transaction = db.transaction(storeName, "readwrite");
            let objectStore = transaction.objectStore(storeName);

            objectStore.clear().onsuccess = function() {
                resolve(`Object store "${storeName}" cleared successfully`);
            };

            objectStore.clear().onerror = function(event) {
                reject(`Error clearing object store "${storeName}"`);
            };
        };

        request.onerror = function(event) {
            reject("Error opening database");
        };
    });
}


function checkEmptyArrays(result) {
    if (Array.isArray(result) && result.every(arr => Array.isArray(arr) && arr.length === 0)) {
        return null;
    }
    return result;
}