'use strict';

let ble = null;
let bleDevice = null;
let shouldConnect = true;
let scheduleopen = false;
let wifiopen = false;
let alarmstatus = false;


//db
// const request = indexedDB.open("MyTestDatabase", 1);
// request.onupgradeneeded = (event) => {
//     const db = request.result;
//     if (!db.objectStoreNames.contains("imu")) {
//         db.createObjectStore("imu", { keyPath: "id" });
//     }
// };

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
        document.querySelector('.togglealarm').textContent = "Alarm: On";
        const msg = stringToArrayBuffer("1");
        await ble.writeValue(msg)
        alarmstatus = true
    }else{
        document.querySelector('.togglealarm').textContent = "Alarm: Off";
        const msg = stringToArrayBuffer("0");
        await ble.writeValue(msg)
        alarmstatus = false
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

async function handleWifiFormSubmit(event){
    event.preventDefault();
    const ssid = document.getElementById('wifissid').value;
    const password = document.getElementById('wifipassword').value;
    const msg = stringToArrayBuffer(ssid+":wf:"+password);
    await ble.writeValue(msg)
}

async function handleToken() {
    try {
        const token = OneSignal.User.onesignalId;
        const msg = `tkn:${token}:tkn`;
        const chunkSize = 20; // BLE typically supports 20 bytes per write
        const chunks = splitIntoChunks(msg, chunkSize);

        for (const chunk of chunks) {
            const arrayBuffer = stringToArrayBuffer(chunk);
            await ble.writeValue(arrayBuffer);
            await sleep(100); // Small delay to ensure the BLE stack processes each chunk
        }

        console.log("Token sent successfully");
    } catch (error) {
        console.error("Error sending token:", error);
    }
}

function splitIntoChunks(str, chunkSize) {
    const chunks = [];
    for (let i = 0; i < str.length; i += chunkSize) {
        chunks.push(str.substring(i, i + chunkSize));
    }
    return chunks;
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

async function handleAlarmFormSubmit(event) {
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
    let encoder = new TextEncoder();
    let uint8Array = encoder.encode(str);
    return uint8Array.buffer;
}