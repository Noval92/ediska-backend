const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Friendship = require('../models/Friendship');

// Kirim permintaan teman
router.post('/request', async (req, res) => {
  const { userId, friendId } = req.body;
  let exist = await Friendship.findOne({ userId, friendId });
  if (exist) return res.status(400).json({ message: 'Sudah pernah mengirim permintaan' });
  let friendship = new Friendship({ userId, friendId });
  await friendship.save();
  res.json({ message: 'Permintaan teman dikirim!' });
});

// Terima permintaan teman
router.post('/accept', async (req, res) => {
  const { userId, friendId } = req.body;
  let friendship = await Friendship.findOne({ userId: friendId, friendId: userId, status: 'pending' });
  if (!friendship) return res.status(400).json({ message: 'Permintaan tidak ditemukan' });
  friendship.status = 'accepted';
  await friendship.save();
  let mutual = new Friendship({ userId, friendId, status: 'accepted' });
  await mutual.save();
  res.json({ message: 'Sudah berteman!' });
});

// List teman sudah diterima
router.get('/list/:userId', async (req, res) => {
  let friends = await Friendship.find({ userId: req.params.userId, status: 'accepted' }).populate('friendId');
  res.json(friends);
});

// List permintaan masuk
router.get('/requests/:userId', async (req, res) => {
  let requests = await Friendship.find({ friendId: req.params.userId, status: 'pending' }).populate('userId');
  res.json(requests);
});

// Rekomendasi teman
router.get('/recommend/:userId', async (req, res) => {
  const userId = req.params.userId;
  // Ambil teman yang sudah diajukan/dikonfirmasi
  const friends = await Friendship.find({ userId }).select('friendId');
  const sentRequests = await Friendship.find({ friendId: userId }).select('userId');
  const already = [
    ...friends.map(f => f.friendId.toString()),
    ...sentRequests.map(f => f.userId.toString()),
    userId
  ];
  // Cari user yang belum berteman/dikirimi request
  const candidates = await User.find({ _id: { $nin: already } }).limit(10);
  res.json(candidates);
});

module.exports = router;
