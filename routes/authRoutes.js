const express = require('express');
const router = express.Router();
const multer = require('multer');
const bcrypt = require('bcryptjs');
const path = require('path');
const User = require('../models/User');

// Setup multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// ===================== REGISTER =====================
router.post('/register', upload.single('foto'), async (req, res) => {
  try {
    const {
      nama, username, email, password,
      nim, nohp, domisili, semester
    } = req.body;

    // Cek username sudah ada
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: 'Username sudah terdaftar.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      nama,
      username,
      email,
      password: hashedPassword,
      nim,
      nohp,
      domisili,
      semester,
      fotoUrl: req.file ? '/uploads/' + req.file.filename : undefined
    });

    await newUser.save();

    // Jangan kirim password ke FE!
    const { password: _, ...userData } = newUser.toObject();

    res.status(201).json({ message: 'Registrasi berhasil', user: userData });
  } catch (err) {
    console.error("REGISTER ERROR:", err);
    res.status(500).json({ error: 'Registrasi gagal' });
  }
});

// ===================== LOGIN =====================
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  console.log('LOGIN ATTEMPT:', username, password); // log request masuk
  try {
    const user = await User.findOne({ username });
    console.log('DB USER:', user); // log hasil find user

    if (!user) {
      console.log("User tidak ditemukan:", username);
      return res.status(400).json({ error: 'Username tidak ditemukan.' });
    }

    const valid = await bcrypt.compare(password, user.password);
    console.log('PASSWORD VALID:', valid);

    if (!valid) {
      return res.status(400).json({ error: 'Password salah.' });
    }

    // Jangan kirim password ke FE!
    const { password: _, ...userData } = user.toObject();

    res.json({ message: 'Login berhasil.', user: userData });
  } catch (err) {
    console.error('LOGIN ERROR:', err);
    res.status(500).json({ error: 'Terjadi kesalahan saat login.' });
  }
});

// ===================== UPDATE PROFILE =====================
router.post('/update', upload.single('foto'), async (req, res) => {
  try {
    const { id, username, password, nim, fakultas } = req.body;
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ error: 'User tidak ditemukan.' });

    if (username) user.username = username;
    if (password) user.password = await bcrypt.hash(password, 10);
    if (nim) user.nim = nim;
    if (fakultas) user.fakultas = fakultas;
    if (req.file) user.fotoUrl = '/uploads/' + req.file.filename;

    await user.save();
    const { password: _, ...userData } = user.toObject();
    res.json({ message: 'Profil diperbarui.', user: userData });
  } catch (err) {
    console.error('UPDATE ERROR:', err);
    res.status(500).json({ error: 'Gagal memperbarui profil.' });
  }
});

module.exports = router;
