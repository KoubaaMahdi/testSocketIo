const express = require('express');
const app = express();
const http = require('http')
const server = http.createServer(app);
const {Server} =require('socket.io');
const {instrument} = require('@socket.io/admin-ui')
const path = require('path');
const roomsList=[]
app.engine('html',require('ejs').renderFile);
app.set('view engine','html');
const io = require("socket.io")(server, {
  cors: {
    origin: "http://localhost:4200",
    methods: ["GET", "POST"],
    allowedHeaders: ["my-custom-header"],
    credentials: true
  }
});

instrument(io,{
  auth:false
})
app.use('/admin-ui', express.static(__dirname + '/socket.io-admin-ui/ui/dist'));
// Serve the HTML file
app.get('/', (req, res) => {
  res.sendFile(__dirname+"/login.html");
});
app.get('/choose', (req, res) => {
  //res.sendFile(__dirname+"/index.html");
  res.render(path.join(__dirname,'/','index.html'),{rooms:roomsList})
});
app.get('/room1', (req, res) => {
  res.sendFile(__dirname+"/room1.html");
});
app.get('/room2', (req, res) => {
  res.sendFile(__dirname+'/room2.html');
});
app.get('/admin', (req, res) => {
  //res.sendFile(__dirname+'/admin.html');
  res.render(path.join(__dirname,'/','admin.html'),{rooms:roomsList})
});
app.get('/room/', (req, res) => {
  var name = req.query.name;
  res.render(path.join(__dirname,'/','rooms.html'),{rooms:name})
});
app.get('/addRoom/', (req, res) => {
  var name = req.query.name;
  if(!roomsList.includes(name) )
  roomsList.push(name);
  res.sendStatus(200);
});

// Handle socket connection
io.on('connection', (socket) => {
  console.log('A user connected');
  socket.on('join',(data)=>{
    socket.join(data.room);
  });
  // Handle incoming messages
  socket.on('chat message', (data) => {
    console.log('Message:', data);
    //console.log('room:', data.room);
    // Broadcast the message to all connected clients
    io.emit('chat message', data);
  });
  socket.on('fileUpload', (fileData) => {
    // Process the file data
    io.to(data.room).emit('Received file:', fileData);
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
