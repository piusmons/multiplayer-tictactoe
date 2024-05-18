const express = require('express')
const app = express()
const port = 3000
const { createServer } = require('node:http');
const { Server } = require('socket.io');
const calculateWinner = require('./calculateWinner.js')
const server = createServer(app);
const cors = require("cors")
app.use(cors());
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173"
  }
});

let players = []

let game = {
  history: [{ board: Array(9).fill(null), currentPlayer: 'X' }],
  currentMove: 0,
};

io.on('connection', (socket) => {
  console.log(`a user connected: ${socket.id}`);

  //If room is full, any other clients should be rejected until the game is reset.
  if (players.length >= 2) {
    socket.emit('roomFull', 'Room is full. Please try again later.');
    socket.disconnect(true);
    return;
  }
  //The first client to connect should be player 0, the second client should be player 1
  let role;
  if (players.length === 0) {
    role = 'Player 1';
  } else if (players.length === 1) {
    role = 'Player 2';
  } 

  players.push({ id: socket.id, role })
  io.to(socket.id).emit('assignRole', { role });

  socket.on('disconnect', () => {
    console.log(`a user disconnected: ${socket.id}`);
  });

  socket.on('message', (message) => {
    console.log('Received message:', message);
    io.emit('message', message);
  });

  //receive player move data and update game state
  socket.on("makeMove", (data) => {
    console.log("MoveMade", data)


    io.emit("moveMade", data);
  });

});

app.get('/', (req, res) => {
  res.send('asdas')
})

server.listen(port, () => {
  console.log(`app listening on port ${port}`)
})