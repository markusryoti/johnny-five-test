const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path');

app.use(express.static(__dirname + '/client'));

app.get('/', (req, res) => {
  res.sendFile(path.resolve('index.html'));
});

const five = require('johnny-five');
const board = new five.Board();

let led;
let thermometer;
let rgb;

board.on('ready', () => {
  led = new five.Led(13);

  thermometer = new five.Thermometer({
    controller: 'TMP36',
    pin: 'A0',
  });

  rgb = new five.Led.RGB({
    pins: {
      red: 6,
      green: 5,
      blue: 3,
    },
  });

  rgb.on();
  rgb.color('#FF0000');

  thermometer.on('change', () => {
    const { celsius } = thermometer;
    if (connection) {
      io.emit('temperature-change', celsius);
    }
  });
});

const connection = io.on('connection', (socket) => {
  console.log('User connected');
  socket.on('on', () => led.on());
  socket.on('off', () => led.off());
  socket.on('blink', () => led.blink(500));
  socket.on('stop', () => led.stop());
  socket.on('rgb-color-change', (color) => rgb.color(color));

  return socket;
});

http.listen(5000, () => {
  console.log('listening on *:5000');
});
