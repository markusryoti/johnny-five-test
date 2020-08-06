const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path');

const five = require('johnny-five');
const board = new five.Board();
let led;

board.on('ready', () => {
  led = new five.Led(13);
});

app.use(express.static(__dirname + '/client'));

app.get('/', (req, res) => {
  res.sendFile(path.resolve('index.html'));
});

io.on('connection', (socket) => {
  console.log('a user connected');

  socket.on('on', () => led.on());

  socket.on('off', () => led.off());

  socket.on('blink', () => led.blink(500));

  socket.on('stop', () => led.stop());
});

http.listen(5000, () => {
  console.log('listening on *:5000');
});
