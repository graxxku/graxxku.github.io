'use strict';

let ledCharacteristic = null;
let tess = null;
let sendmode = null;
let poweredOn = false;

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
    console.log('tes5');
    navigator.bluetooth.requestDevice(
        {
            acceptAllDevices: true
        })
        .then(device => {
            console.log('> Found ' + device.name);
            console.log('Connecting to GATT Server...');
            device.addEventListener('gattserverdisconnected', onDisconnected)
            return device.gatt.connect();
        })
        .then(server => {
            console.log('Getting Service');
            return server.getPrimaryService('6E400001-B5A3-F393-E0A9-E50E24DCCA9E'.toLowerCase());
        })
        .then(service => {
            //create notification
            tess = service;
            return service.getCharacteristic('6E400003-B5A3-F393-E0A9-E50E24DCCA9E'.toLowerCase());
        })
        .then(characteristic => {
            ledCharacteristic = characteristic;
            ledCharacteristic.addEventListener('characteristicvaluechanged',handleNotif);
            ledCharacteristic.startNotifications();
            enableSend();
            onConnected();
        })
        .catch(error => {
            console.log('Argh! ' + error);
        });
}

function enableSend(){
    return tess.getCharacteristic('6E400002-B5A3-F393-E0A9-E50E24DCCA9E'.toLowerCase()).then(temp =>
        {
            sendmode = temp;
        }    
    )
}

function handleNotif(event) {
    console.log(event.target.value);
  }

function powerOn() {
    const string = "alarm:on";
    const uint8Array = Uint8Array.from(string.split("").map((x) => x.charCodeAt()));
  return sendmode.writeValue(uint8Array)
      .catch(err => console.log('Error when powering on! ', err))
      .then(() => {
          poweredOn = true;
          toggleButtons();
      });
}

function powerOff() {
    const string = "alarm:off";
    const uint8Array = Uint8Array.from(string.split("").map((x) => x.charCodeAt()));
  return sendmode.writeValue(uint8Array)
      .catch(err => console.log('Error when switching off! ', err))
      .then(() => {
          poweredOn = false;
          toggleButtons();
      });
}

function togglePower() {
    if (poweredOn) {
        powerOff();
    } else {
        powerOn();
    }
}

function toggleButtons() {
    Array.from(document.querySelectorAll('.color-buttons button')).forEach(function(colorButton) {
      colorButton.disabled = !poweredOn;
    });
    document.querySelector('.mic-button button').disabled = !poweredOn;
}

function setColor(red, green, blue) {
    const string = "refresh";
    const uint8Array = Uint8Array.from(string.split("").map((x) => x.charCodeAt()));

    //let data = new Uint8Array([0x56, red, green, blue, 0x00, 0xf0, 0xaa]);
    return sendmode.writeValue(uint8Array)
        .catch(err => console.log('Error when writing value! ', err));
}

function red() {
    return setColor(255, 0, 0)
        .then(() => console.log('Color set to Red'));
}

function green() {
    return setColor(0, 255, 0)
        .then(() => console.log('Color set to Green'));
}

function blue() {
    return setColor(0, 0, 255)
        .then(() => console.log('Color set to Blue'));
}

// Install service worker - for offline support
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('serviceworker.js');
}
