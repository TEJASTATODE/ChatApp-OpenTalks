const express = require('express');
const {Router} = require('express');

const Message = require('../models/messages');
const { requireAuth } = require('../middlewares/Auth');
const router = Router();

router.get('/chat',  async (req, res) => {
  try {
    const messages = await Message.find().sort({ timestamp: -1 });
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching messages', error: error.message });
  }
});
router.post('/chat', requireAuth, async (req, res) => {
  const { sender, message } = req.body;

  if (!sender || !message) {
    return res.status(400).json({ message: 'Sender and message are required' });
  }

  try {
    const newMessage = new Message({ sender, message });
    await newMessage.save();
    res.status(201).json(newMessage);
  } catch (error) {
    res.status(500).json({ message: 'Error saving message', error: error.message });
  }
});

module.exports = router;
