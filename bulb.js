'use strict';

let notifyCharacter = null;
let writeCharacter = null;
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
    console.log('tes3');
    navigator.bluetooth.requestDevice(
        {
            filters: [{ name: ["glert"] }],
            optionalServices: [
                '6E400001-B5A3-F393-E0A9-E50E24DCCA9E'.toLowerCase(),
                '6E400003-B5A3-F393-E0A9-E50E24DCCA9E'.toLowerCase()],
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
            return [
                service.getCharacteristic('6E400002-B5A3-F393-E0A9-E50E24DCCA9E'.toLowerCase()),
                service.getCharacteristic('6E400003-B5A3-F393-E0A9-E50E24DCCA9E'.toLowerCase())
            ];
        })
        .then(characteristics => {
            writeCharacter = characteristics[0];
            notifyCharacter = characteristics[1];
            notifyCharacter.addEventListener('characteristicvaluechanged',handleNotif);
            notifyCharacter.startNotifications();
            onConnected();
        })
        .catch(error => {
            console.log('Argh! ' + error);
        });
}


function handleNotif(event) {
    console.log(event.target.value);
  }

function powerOn() {
  let data = new Uint8Array([0xcc, 0x23, 0x33]);
  return writeCharacter.writeValue(data)
      .catch(err => console.log('Error when powering on! ', err))
      .then(() => {
          poweredOn = true;
          toggleButtons();
      });
}

function powerOff() {
  let data = new Uint8Array([0xcc, 0x24, 0x33]);
  return writeCharacter.writeValue(data)
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
}

function setColor() {
    const msg = Array.from("refresh", char => char.charCodeAt(0));
    //let data = new Uint8Array([0x56, red, green, blue, 0x00, 0xf0, 0xaa]);
    return writeCharacter.writeValue(msg)
        .catch(err => console.log('Error when writing value! ', err));
}


// Install service worker - for offline support
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('serviceworker.js');
}
