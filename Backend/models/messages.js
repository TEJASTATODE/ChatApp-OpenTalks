const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
    sender: { type: String, required: true },
    receiver: { type: String, required: false },
    message: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    reactions: [{ type: String }],
});

const Message = mongoose.model('Message', MessageSchema);
module.exports = Message;
