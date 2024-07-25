'use strict';

let readC1 = null;
let readC2 = null;
let firstConnected = false;
const cvs = document.getElementById('canvas');

//db
const request = indexedDB.open("MyTestDatabase", 1);
request.onupgradeneeded = (event) => {
    const db = request.result;
    if (!db.objectStoreNames.contains("imu")) {
        db.createObjectStore("imu", { keyPath: "id" });
    }
};

//resize
function onWindowResize(event)
{
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(cvs.offsetWidth,cvs.offsetHeight,true);
}


function toggleContent() {
    const setting1Content = document.getElementById('setting1-content');
    setting1Content.style.display = (setting1Content.style.display === 'none') ? 'block' : 'none';
}

const tabContents = document.querySelectorAll('.tab-content');
tabContents.forEach(content => {
    content.style.display = 'none';
});

function home(){
    tabContents.forEach(content => {
        content.style.display = 'none';
    });
    tabContents[0].style.display = 'block';
    tabContents[1].style.display = 'block';
    tabContents[2].style.display = 'block';
    cvs.style.display = 'block';
    onWindowResize();
}

function settings(){
    tabContents.forEach(content => {
        content.style.display = 'none';
    });
    tabContents[3].style.display = 'block';
    cvs.style.display = 'none';
    onWindowResize();
    
}

function onConnected() {
    //document.querySelector('.connect-button').classList.add('hidden');
    document.querySelector('.power-button').classList.remove('hidden');
}

function onDisconnected() {
    document.querySelector('.connect-button').classList.remove('hidden');
    document.querySelector('.power-button').classList.add('hidden');
}

function connect1() {
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
            readC1 = characteristic;   
            firstConnected = true;
        })
        .catch(error => {
            console.log('Argh! ' + error);
        });
}

function connect2() {
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
            readC2 = characteristic;   
            onConnected();
        })
        .catch(error => {
            console.log('Argh! ' + error);
        });
}

async function togglePower() {

    let timestamp = Date.now()

    let imu1 = await readC1.readValue().then(dataview => {
        let arr = new Uint8Array(dataview.buffer);
        let imu1 = { id: timestamp, content: arr };
        return imu1
    })
    
    let imu2 = await readC2.readValue().then(dataview => {
        let arr = new Uint8Array(dataview.buffer);
        let imu2 = { id: timestamp, content: arr };
        return imu2
    })

    const db = request.result;
    const transaction = db.transaction("imu", "readwrite");
    const imuStore = transaction.objectStore("imu");
    imuStore.add(imu1);
    imuStore.add(imu2);
}
