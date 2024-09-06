'use strict';

let ble = null;
let bleDevice = null;
let shouldConnect = true;

//db
const request = indexedDB.open("MyTestDatabase", 1);
request.onupgradeneeded = (event) => {
    const db = request.result;
    if (!db.objectStoreNames.contains("imu")) {
        db.createObjectStore("imu", { keyPath: "id" });
    }
};

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

async function recordData() {

    const numSamples = 60;
    const samplesPerSet = 12; // 6 values for accelerometer and 6 for gyroscope

    for(let i=0; i<10; i++){
        const timestamp = Date.now()
        const imu = await ble.readValue()
        const buf = new Uint8Array(imu.buffer)
        console.log(buf);
        
        
        
        // .then(dataview => {
        //     //60 data point
        //     const buf = new Uint8Array(dataview.buffer)
        //     const accData = [];
        //     const gyroData = [];
        //     for (let j = 0; i < numSamples; j += samplesPerSet) {
        //         const acc_x = toSigned16Bit(buf[j + 1], buf[j]);
        //         const acc_y = toSigned16Bit(buf[j + 3], buf[j + 2]);
        //         const acc_z = toSigned16Bit(buf[j + 5], buf[j + 4]);

        //         const gyro_x = toSigned16Bit(buf[j + 7], buf[j + 6]);
        //         const gyro_y = toSigned16Bit(buf[j + 9], buf[j + 8]);
        //         const gyro_z = toSigned16Bit(buf[j + 11], buf[j + 10]);
            
        //         // Store the extracted values
        //         accData.push({ x: acc_x, y: acc_y, z: acc_z });
        //         gyroData.push({ x: gyro_x, y: gyro_y, z: gyro_z });
        //     }
        //     let temp = { id: timestamp, content: {accelerometer:accData,gyroscope:gyroData}};
        //     return temp
        // })

        // const db = request.result;
        // const transaction = db.transaction("imu", "readwrite");
        // const imuStore = transaction.objectStore("imu");
        // imuStore.add(imu);
        await sleep(1000);
    }  
}
