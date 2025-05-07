const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const { nama, username, email, password } = req.body;
    const existing = await User.findOne({ username });
    if (existing) return res.status(400).json({ error: 'Username sudah digunakan' });

    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ nama, username, email, password: hashed });
    await user.save();
    res.json({ message: 'Registrasi berhasil' });
  } catch (err) {
    res.status(500).json({ error: 'Gagal registrasi' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ error: 'User tidak ditemukan' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Password salah' });

    res.json({ message: 'Login berhasil', user: { id: user._id, nama: user.nama } });
  } catch (err) {
    res.status(500).json({ error: 'Gagal login' });
  }
});

module.exports = router;
