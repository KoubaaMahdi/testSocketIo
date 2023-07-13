const Mongoose = require('mongoose');

const messageShemer = new Mongoose.Schema({
  event: { type: String, required: true },
  sender: { type: String, required: true },
  reciever: { type: String, required: true },
  data: { type: String, required: true },
  date: { type: Date, required: true }
});

const Message = Mongoose.model('messages', messageShemer);

module.exports = Message;
