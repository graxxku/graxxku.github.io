'use strict';

let ble = null;
let bleDevice = null;
let shouldConnect = true;
let scheduleopen = false;
let wifiopen = false;
let alarm = false;

//hide notif
function waitForElementToExist(id) {
    return new Promise(resolve => {
        if (document.getElementById(id)) {
            return resolve(document.getElementById(id));
        }

        const observer = new MutationObserver(() => {
            if (document.getElementById(id)) {
                resolve(document.getElementById(id));
                observer.disconnect();
            }
        });

        observer.observe(document.body, { childList: true, subtree: true });
    });
}

// Usage
waitForElementToExist('onesignal-bell-container').then(element => {
  document.getElementById('onesignal-bell-container').style.display = 'none';
});


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

async function toggleBle() {
    if(shouldConnect){
        let service = navigator.bluetooth.requestDevice(
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
                return service
            }
        )

        ble_read = await service.getCharacteristic('07af27a6-9c22-11ea-9afe-02fcdc4e7412');
        ble_write = await service.getCharacteristic('07af27a6-9c22-11ea-9afe-02fcdc4e7412');
        onConnected();

    }else{
        bleDevice.gatt.disconnect();
    }    
}

const sleep = ms => new Promise(res => setTimeout(res, ms));

function alarm(){
    alarm = !alarm;
    console.log("alarm");
}

function wifi(){
    if(wifiopen){
        document.getElementById('wifiForm').style.display = 'none';
        wifiopen = false;
    }else{
        document.getElementById('wifiForm').style.display = 'block';
        wifiopen = true;
    }
}

function schedule(){
    if(scheduleopen){
        document.getElementById('scheduleForm').style.display = 'none';
        scheduleopen = false;
    }else{
        document.getElementById('scheduleForm').style.display = 'block';
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