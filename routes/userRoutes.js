const express = require('express');
const router = express.Router();
const User = require('../models/User');
const multer = require('multer');
const fs = require('fs');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = 'uploads/';
    if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '_'));
  }
});
const upload = multer({ storage });

// Ambil user
router.get('/:id', async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: 'User tidak ditemukan' });
  res.json(user);
});

// Update user lengkap
router.put('/:id', upload.single('foto'), async (req, res) => {
  const update = { ...req.body };
  if (req.file) update.foto = req.file.path;
  
  const user = await User.findByIdAndUpdate(req.params.id, update, { new: true });
  if (!user) return res.status(404).json({ message: 'User tidak ditemukan' });

  res.json(user);
});

module.exports = router;
