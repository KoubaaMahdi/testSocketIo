const express = require('express');
const app = express();
const http = require('http')
const server = http.createServer(app);
const {Server} =require('socket.io');
const {instrument} = require('@socket.io/admin-ui')


const io = new Server(server,{
  cors: {
    origin:["https://admin.socket.io"]
  }
});
instrument(io,{
  auth:false
})
// Serve the HTML file
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// Handle socket connection
io.on('connection', (socket) => {
  console.log('A user connected');

  // Handle incoming messages
  socket.on('chat message', (msg) => {
    console.log('Message:', msg);
    // Broadcast the message to all connected clients
    io.emit('chat message', msg);
  });

  // Handle disconnect event
  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

// Start the server
const port = 3000;
server.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
