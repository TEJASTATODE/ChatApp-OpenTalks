const mongoose = require('mongoose');

const PrivateMessageSchema = new mongoose.Schema({
    sender: { type: String, required: true },
    receiver: { type: String, required: true },
    message: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    avatar: { type: String, default: 'default.png' },
});

const PrivateMessage = mongoose.model('PrivateMessage', PrivateMessageSchema);
module.exports = PrivateMessage;
