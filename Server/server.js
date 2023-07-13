const Message = require('./messageShemer');
const fs = require('fs');
const Mongoose = require('mongoose');
const { MongoClient, ServerApiVersion } = require("mongodb");
const express = require('express');
const app = express();
const http = require('http')
const server = http.createServer(app);
const { instrument } = require('@socket.io/admin-ui')
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
const os = require('os');
const username = 'admin';
const password = 'admin';// Get the IP address
const filePath = '/uploaded/';
const ip = 'http://localhost:4200';
let fileName
Mongoose.connect("mongodb+srv://mahdikoubaa:0uS9MXgQBWdgdiG5@chatdatabase.pvqgous.mongodb.net/messages?retryWrites=true&w=majority", {
  useNewUrlParser: true,
});
const io = require("socket.io")(server, {
  maxHttpBufferSize: 1e11,
  cors: {
    origin: ip,
    methods: ["GET", "POST"],
    allowedHeaders: ["my-custom-header"],
    credentials: true
  }
});

instrument(io, {
  auth: false
})
app.use('/admin-ui', express.static(__dirname + '/socket.io-admin-ui/ui/dist'));
// Handle socket connection
const connectedClients = new Map();
io.use((socket, next) => {
  const username = socket.handshake.auth.name;
  if (!username) {
    return next(new Error("invalid username"));
  }
  if (!connectedClients.has(username)) {
    connectedClients.set(username, [socket.id])
  } else {
    connectedClients.get(username).push(socket.id);
  }
  socket.username = username
  console.log(connectedClients)
  next();
})
io.on('connection', (socket) => {
  console.log("Connected")
  socket.on('join', (data) => {
    console.log("joined room", data)
    socket.join(data);
  });
  // Handle incoming messages
  socket.on('chat message', async (data) => {
    console.log("salem")
    await Message.create({
      event: data.event, sender: data.username, reciever: data.room, data: data.value, date: new Date()
    })
    console.log('Message:', data);
    socket.to(data.room).emit('chat message', data);
  });
  socket.on('fileName', (filename) => {
    this.fileName = filename
    console.log(filename)

  })
  socket.on("upload room", async (data) => {
    console.log(data)
    await Message.create({
      event: data.event, sender: data.username, reciever: data.room, data: data.value, date: new Date()
    })
    socket.to(data.room).emit('upload room', data);
  })
  socket.on("upload", (file, callback) => {
    console.log(file)
    let options = {
      hostname: 'localhost',
      port: 5000,
      path: '/remote.php/dav/files/admin' + filePath + this.fileName,
      method: 'PUT',
      headers: {
        'Authorization': 'Basic ' + Buffer.from(username + ':' + password).toString('base64'),
        'Content-Type': 'application/octet-stream', // Adjust the content type based on your file type
        'Content-Length': file.length
      }
    };

    const req = http.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        console.log(responseData); // Handle the response data
        callback(null, responseData); // Invoke the callback with the response data
      });
    });

    req.on('error', (error) => {
      console.error(error);
      callback(error); // Invoke the callback with the error
    });

    req.write(file); // Write the file buffer to the request body
    req.end();
  });

  socket.on('private msg', async (data) => {
    let testSockets = connectedClients.get(data.room);
    await Message.create({
      event: data.event, sender: data.username, reciever: data.room, data: data.value, date: new Date()
    })
    console.log("test")
    if (Array.isArray(testSockets) && testSockets.length > 0) {
      testSockets.forEach(socketId => {
        socket.to(socketId).emit('private msg', data);
      });
    }

    testSockets = connectedClients.get(data.username);

    if (Array.isArray(testSockets) && testSockets.length > 0) {
      testSockets.forEach(socketId => {
        socket.to(socketId).emit('private msg', data);
      });
    }
  });

  socket.on('private upload', async (data) => {
    console.log(data)
    await Message.create({
      event: data.event,
      sender: data.username,
      reciever: data.room,
      data: data.value,
      date: new Date()
    });

    let testSockets = connectedClients.get(data.room);
    if (testSockets) {
      testSockets.forEach(socketId => {
        socket.to(socketId).emit('private msg', data);
      });
    }

    testSockets = connectedClients.get(data.username);
    if (testSockets) {
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

function generateRandomString(length) {
  const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters.charAt(randomIndex);
  }
  return result;
}

// Start the server
const port = 3000;
server.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});