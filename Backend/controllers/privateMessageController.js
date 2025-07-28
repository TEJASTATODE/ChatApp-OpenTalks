const PrivateMessage = require('../models/PrivateMessage');

exports.saveMessage = async (req, res) => {
  try {
    const { sender, receiver, message, timestamp, avatar } = req.body;

    // Log incoming data for debugging
    console.log("Incoming message data:", req.body);

    // Basic validation
    if (!sender || !receiver || !message) {
      return res.status(400).json({ error: 'Sender, receiver, and message are required.' });
    }

    const newMessage = new PrivateMessage({
      sender,
      receiver,
      message,
      timestamp: timestamp || Date.now(),
      avatar: avatar || 'default.png',
    });

    await newMessage.save();

    res.status(201).json({ message: 'Message saved successfully' });
  } catch (error) {
    console.error('Error saving message:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
