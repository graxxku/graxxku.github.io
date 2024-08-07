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

    for(let i=0; i<60; i++){
        let timestamp = Date.now()
        let imu = await ble.readValue().then(dataview => {
            var enc = new TextDecoder("utf-8");
            let imu2 = { id: timestamp, content: enc.decode(dataview) };
            console.log(imu2.content);
            return imu2
        })
        const db = request.result;
        const transaction = db.transaction("imu", "readwrite");
        const imuStore = transaction.objectStore("imu");
        imuStore.add(imu);
        await sleep(1000);
    }  
}
