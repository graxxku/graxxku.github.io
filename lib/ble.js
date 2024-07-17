'use strict';

let notifCharacteristic = null;
let sendCharacteristic = null;
let poweredOn = false;

const cvs = document.getElementById('canvas');


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
    cvs.style.display = 'block';
    onWindowResize();
}
function settings(){
    tabContents.forEach(content => {
        content.style.display = 'none';
    });
    tabContents[1].style.display = 'block';
    cvs.style.display = 'none';
    onWindowResize();
    
}

function onConnected() {
    document.querySelector('.connect-button').classList.add('hidden');
    document.querySelector('.color-buttons').classList.remove('hidden');
    document.querySelector('.mic-button').classList.remove('hidden');
    document.querySelector('.power-button').classList.remove('hidden');
    poweredOn = true;
}

function onDisconnected() {
    document.querySelector('.connect-button').classList.remove('hidden');
    document.querySelector('.color-buttons').classList.add('hidden');
    document.querySelector('.mic-button').classList.add('hidden');
    document.querySelector('.power-button').classList.add('hidden');
}

function connect() {
    console.log('Requesting Bluetooth Device...');
    navigator.bluetooth.requestDevice(
        {
            acceptAllDevices:true,
            optionalServices: ['07af27a6-9c22-11ea-9afe-02fcdc4e7412']
        })
        .then(device => {
            console.log('> Found ' + device.name);
            console.log('Connecting to GATT Server...');
            device.addEventListener('gattserverdisconnected', onDisconnected)
            return device.gatt.connect();
        })
        .then(server => {
            console.log('Getting Service 0xffe5 - Light control...');
            return server.getPrimaryService(0xffe5);
        })
        .then(service => {
            console.log('Getting Characteristic 0xffe9 - Light control...');
            return service;
        })
        .then(service => {
            console.log('All ready!');
            //notifCharacteristic = service.getCharacteristic('6E400003-B5A3-F393-E0A9-E50E24DCCA9E'.toLowerCase());
            sendCharacteristic = service.getCharacteristic('07af27a6-9c22-11ea-9afe-02fcdc4e7412');
            //notifCharacteristic.addEventListener('characteristicvaluechanged',handleNotif);
            //notifCharacteristic.startNotifications();
            onConnected();
        })
        .catch(error => {
            console.log('Argh! ' + error);
        });
}

function handleNotif(event) {
    console.log(event.target.value);
}

function togglePower() {
    console.log(sendCharacteristic.readValue());
}
