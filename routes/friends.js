const express = require('express');
const router = express.Router();
const Friendship = require('../models/Friendship');
router.post('/request', async (req, res) => {
  const { userId, friendId } = req.body;
  let friendship = new Friendship({ userId, friendId });
  await friendship.save();
  res.json({ message: 'Permintaan teman dikirim!' });
});
router.post('/accept', async (req, res) => {
  const { userId, friendId } = req.body;
  let friendship = await Friendship.findOne({ userId: friendId, friendId: userId, status: 'pending' });
  friendship.status = 'accepted';
  await friendship.save();
  let mutual = new Friendship({ userId, friendId, status: 'accepted' });
  await mutual.save();
  res.json({ message: 'Sudah berteman!' });
});
router.get('/list/:userId', async (req, res) => {
  let friends = await Friendship.find({ userId: req.params.userId, status: 'accepted' }).populate('friendId');
  res.json(friends);
});
module.exports = router;