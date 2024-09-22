'use strict';

let ble = null;
let bleDevice = null;
let shouldConnect = true;
let scheduleopen = false;
let wifiopen = false;
let alarmstatus = false;


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
                optionalServices: ['19b10000-e8f2-537e-4f6c-d104768a1214','19b10001-e8f2-537e-4f6c-d104768a1214']
            })
            .then(device => {
                device.addEventListener('gattserverdisconnected', onDisconnected)
                bleDevice = device;
                return device.gatt.connect();
            })
            .then(server => {
                return server.getPrimaryService('19b10000-e8f2-537e-4f6c-d104768a1214');
            })
            .then(service => {
                return service.getCharacteristic('19b10001-e8f2-537e-4f6c-d104768a1214');
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

async function alarm(){
    if(alarmstatus == false){
        const msg = stringToArrayBuffer("1");
        await ble.writeValue(msg)
    }else{
        const msg = stringToArrayBuffer("0");
        await ble.writeValue(msg)
    }
    
}

function wifi(){
    const wifiForm = document.getElementById('wifiForm');
    if(wifiopen){
        wifiForm.classList.add('hidden');
        wifiopen = false;
    }else{
        wifiForm.classList.remove('hidden');
        wifiopen = true;
    }
}

function schedule() {
    const scheduleForm = document.getElementById('scheduleForm');
    if (scheduleopen) {
        scheduleForm.classList.add('hidden');
        scheduleopen = false;
    } else {
        scheduleForm.classList.remove('hidden');
        scheduleopen = true;
    }
}

function handleAlarmFormSubmit(event) {
    event.preventDefault();
    const days = Array.from(document.querySelectorAll('input[name="days"]:checked')).map(el => el.value);
    const timeOn = document.getElementById('time_on').value;
    const timeOff = document.getElementById('time_off').value;
    const output = {
        days_chosen: days,
        time_on_to_off: {
            time_on: timeOn,
            time_off: timeOff
        }
    };
    console.log(JSON.stringify(output));
}


function stringToArrayBuffer(str) {
    // Create a TextEncoder instance
    let encoder = new TextEncoder();
    // Encode the string into a Uint8Array
    let uint8Array = encoder.encode(str);
    // Return the buffer property of the Uint8Array
    return uint8Array.buffer;
}