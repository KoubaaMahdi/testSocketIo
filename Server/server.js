const express = require('express');
const app = express();
const http = require('http')
const server = http.createServer(app);
const {instrument} = require('@socket.io/admin-ui')
app.engine('html',require('ejs').renderFile);
app.set('view engine','html');
const os = require('os');

// Get the IP address

const ip = 'http://172.16.0.195:4200';
const io = require("socket.io")(server, {
  cors: {
    origin: ip ,
    methods: ["GET", "POST"],
    allowedHeaders: ["my-custom-header"],
    credentials: true
  }
});

instrument(io,{
  auth:false
})
app.use('/admin-ui', express.static(__dirname + '/socket.io-admin-ui/ui/dist'));
// Handle socket connection
const connectedClients = new Map();

io.use((socket, next) => {
  const username = socket.handshake.auth.name;
  if (!username) {
    return next(new Error("invalid username"));
  }

  // Vérifier si le nom d'utilisateur existe déjà dans les clients connectés
  if (!connectedClients.has(username)) {
    // Réutiliser le socket du client existant pour le même nom d'utilisateur
    connectedClients.set(username,[socket.id])
    
    
  }else{
    connectedClients.get(username).push(socket.id);
  }
  socket.username=username
  console.log(connectedClients)
  next();
  
  
})
io.on('connection', (socket) => {
  console.log("Connected")
  socket.on('join',(data)=>{
    console.log("joined room",data)
    socket.join(data);
  });
  // Handle incoming messages
  socket.on('chat message', (data) => {
    console.log('Message:', data);
    socket.to(data.room).emit('chat message', data);
  });
  socket.on('fileUpload', (fileData) => {
    // Process the file data
    io.to(data.room).emit('Received file:', fileData);
  });
  socket.on('private msg', (data) => {
    testSockets = connectedClients.get(data.room)
    testSockets.forEach(socketId => {
      socket.to(socketId).emit('private msg', data);
    });
    testSockets = connectedClients.get(data.username)
    
    if(testSockets){
      testSockets.forEach(socketId => {  
      socket.to(socketId).emit('private msg', data);
    });
    }
      
    
  });
  // Handle disconnect event
  socket.on('disconnect', () => {

    connectedClients.delete(socket.username)
    console.log(connectedClients)
    console.log('A user disconnected');
  });
});



// Start the server
const port = 3000;
server.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});