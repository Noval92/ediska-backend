const express = require('express');
const router = express.Router();
const ChatMessage = require('../models/ChatMessage');
router.post('/send', async (req, res) => {
  const { senderId, receiverId, message } = req.body;
  let msg = new ChatMessage({ senderId, receiverId, message });
  await msg.save();
  res.json({ message: 'Pesan terkirim!' });
});
router.get('/:userId/:friendId', async (req, res) => {
  let messages = await ChatMessage.find({
    $or: [{ senderId: req.params.userId, receiverId: req.params.friendId },
          { senderId: req.params.friendId, receiverId: req.params.userId }]
  }).sort({ timestamp: 1 });
  res.json(messages);
});
module.exports = router;