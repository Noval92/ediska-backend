const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Tambahkan Cloudinary storage:
const { storage } = require('../cloudinary'); // pastikan path sesuai
const multer = require('multer');
const upload = multer({ storage });

// Ambil user
router.get('/:id', async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: 'User tidak ditemukan' });
  res.json(user);
});

// Update user lengkap (foto profil sekarang langsung ke Cloudinary)
router.put('/:id', upload.single('foto'), async (req, res) => {
  const update = { ...req.body };
  if (req.file) update.foto = req.file.path; // file.path = url Cloudinary
  const user = await User.findByIdAndUpdate(req.params.id, update, { new: true });
  if (!user) return res.status(404).json({ message: 'User tidak ditemukan' });
  res.json(user);
});

module.exports = router;
