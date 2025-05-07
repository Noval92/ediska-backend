const express = require('express');
const router = express.Router();
const multer = require('multer');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// Konfigurasi upload foto profil
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ error: 'Username tidak ditemukan.' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ error: 'Password salah.' });

    res.json({ message: 'Login berhasil.', user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Terjadi kesalahan saat login.' });
  }
});

// POST /api/auth/update
router.post('/update', upload.single('foto'), async (req, res) => {
  try {
    const { id, username, password, nim, fakultas } = req.body;
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ error: 'User tidak ditemukan.' });

    if (username) user.username = username;
    if (password) user.password = await bcrypt.hash(password, 10);
    if (nim) user.nim = nim;
    if (fakultas) user.fakultas = fakultas;
    if (req.file) user.foto = req.file.path;

    await user.save();
    res.json({ message: 'Profil diperbarui.', user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal memperbarui profil.' });
  }
});

module.exports = router;
