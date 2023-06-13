// Connect to the server
const socket = io();

// Handle form submission
const form = document.getElementById('chat-form');
const input = document.getElementById('input-message');
form.addEventListener('submit', (event) => {
  event.preventDefault();
  const message = input.value.trim();
  if (message) {
    // Send the message to the server
    socket.emit('chat message', message);
    input.value = '';
  }
});

// Handle incoming messages
const messages = document.getElementById('messages');
socket.on('chat message', (msg) => {
  const li = document.createElement('li');
  li.textContent = msg;
  messages.appendChild(li);
});
