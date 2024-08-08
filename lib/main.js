'use strict';

let ble = null;
// let firstConnected = false;
// const cvs = document.getElementById('canvas');

//db
const request = indexedDB.open("MyTestDatabase", 1);
request.onupgradeneeded = (event) => {
    const db = request.result;
    if (!db.objectStoreNames.contains("imu")) {
        db.createObjectStore("imu", { keyPath: "id" });
    }
};

//resize
// function onWindowResize(event)
// {
//     camera.aspect = window.innerWidth / window.innerHeight;
//     camera.updateProjectionMatrix();

//     renderer.setSize(cvs.offsetWidth,cvs.offsetHeight,true);
// }

function onConnected() {
    //document.querySelector('.connect-button').classList.add('hidden');
    // document.querySelector('.power-button').classList.remove('hidden');
    console.log("connected");
}

function onDisconnected() {
    // document.querySelector('.connect-button').classList.remove('hidden');
    // document.querySelector('.power-button').classList.add('hidden');
    console.log("disconnected");
    
}

function connect() {
    navigator.bluetooth.requestDevice(
        {
            acceptAllDevices:true,
            optionalServices: ['07af27a5-9c22-11ea-9afe-02fcdc4e7412','07af27a6-9c22-11ea-9afe-02fcdc4e7412']
        })
        .then(device => {
            device.addEventListener('gattserverdisconnected', onDisconnected)
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
}

const sleep = ms => new Promise(res => setTimeout(res, ms));

async function pullData() {

    const numSamples = 60;
    const samplesPerSet = 12; // 6 values for accelerometer and 6 for gyroscope

    for(let i=0; i<60; i++){
        let timestamp = Date.now()
        let imu = await ble.readValue().then(dataview => {
            //60 data point
            const uint8data = new Uint8Array(dataview.buffer)
            const accData = [];
            const gyroData = [];
            for (let i = 0; i < numSamples; i += samplesPerSet) {
                const acc_x = (buf[i + 1] << 8) | buf[i];
                const acc_y = (buf[i + 3] << 8) | buf[i + 2];
                const acc_z = (buf[i + 5] << 8) | buf[i + 4];
            
                const gyro_x = (buf[i + 7] << 8) | buf[i + 6];
                const gyro_y = (buf[i + 9] << 8) | buf[i + 8];
                const gyro_z = (buf[i + 11] << 8) | buf[i + 10];
            
                // Store the extracted values
                accData.push({ x: acc_x, y: acc_y, z: acc_z });
                gyroData.push({ x: gyro_x, y: gyro_y, z: gyro_z });
            }
            let temp = { id: timestamp, content: {accelerometer:accData,gyroscope:gyroData}};
            return temp
        })
        const db = request.result;
        const transaction = db.transaction("imu", "readwrite");
        const imuStore = transaction.objectStore("imu");
        imuStore.add(imu);
        await sleep(1000);
    }  
}
