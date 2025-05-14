const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();
const MataKuliah = require('../models/MataKuliah');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const unique = Date.now() + '-' + file.originalname;
    cb(null, unique);
  }
});

const upload = multer({ storage: storage });

router.post('/upload', upload.fields([
  { name: 'materi' },
  { name: 'kuis' },
  { name: 'diskusi' },
  { name: 'tugas' }
]), async (req, res) => {
  try {
    const { semesterId, nama, kode, sks, sesi } = req.body;
    const pdf = {
      materi: req.files['materi']?.[0]?.path || '',
      kuis: req.files['kuis']?.[0]?.path || '',
      diskusi: req.files['diskusi']?.[0]?.path || '',
      tugas: req.files['tugas']?.[0]?.path || ''
    };
    const mk = new MataKuliah({ semesterId, nama, kode, sks, sesi, pdf });
    await mk.save();
    res.json({ message: 'Data dan file disimpan', data: mk });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal menyimpan data mata kuliah' });
  }
});

module.exports = router;
