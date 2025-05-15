// backend/models/MataKuliah.js
const mongoose = require('mongoose');

const mataKuliahSchema = new mongoose.Schema({
  userId: { type: mongoose.Types.ObjectId, ref: 'User', required: true },
  semester: { type: Number, required: true },
  nama: { type: String, required: true },
  kode: { type: String, required: true },
  sks: { type: Number, required: true }
}, { timestamps: true });

module.exports = mongoose.model('MataKuliah', mataKuliahSchema);


// backend/models/MatakuliahSession.js
const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Types.ObjectId, ref: 'User', required: true },
  mataKuliahId: { type: mongoose.Types.ObjectId, ref: 'MataKuliah', required: true },
  session: { type: Number, required: true },
  pelajaran: { type: String },
  materiFile: { type: String },
  materiJudul: { type: String },
  fileLain: { type: String },
  fileLainJudul: { type: String },
  ringkasan: { type: String },
  tugasFile: { type: String },
  tugasLink: { type: String },
  nilai: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('MatakuliahSession', sessionSchema);


// backend/routes/mataKuliahRoutes.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const MataKuliah = require('../models/MataKuliah');
const Session = require('../models/MatakuliahSession');

const router = express.Router();

// setup multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '_' + file.fieldname + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// POST /api/matakuliah  - create mata kuliah
router.post('/', async (req, res) => {
  try {
    const { userId, semester, nama, kode, sks } = req.body;
    const mk = new MataKuliah({ userId, semester, nama, kode, sks });
    await mk.save();
    res.json(mk);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal membuat mata kuliah.' });
  }
});

// POST /api/matakuliah/sessions  - add session detail
router.post('/sessions', upload.fields([
  { name: 'materiFile', maxCount: 1 },
  { name: 'fileLain', maxCount: 1 },
  { name: 'tugasFile', maxCount: 1 }
]), async (req, res) => {
  try {
    const {
      userId,
      matakuliahId,
      session,
      pelajaran,
      materiJudul,
      fileLainJudul,
      ringkasan,
      tugasLink,
      nilai
    } = req.body;

    const sess = new Session({
      userId,
      mataKuliahId: matakuliahId,
      session: parseInt(session, 10),
      pelajaran,
      materiFile: req.files['materiFile'] ? req.files['materiFile'][0].path : undefined,
      materiJudul,
      fileLain: req.files['fileLain'] ? req.files['fileLain'][0].path : undefined,
      fileLainJudul,
      ringkasan,
      tugasFile: req.files['tugasFile'] ? req.files['tugasFile'][0].path : undefined,
      tugasLink,
      nilai
    });
    await sess.save();
    res.json(sess);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal menyimpan sesi.' });
  }
});

// GET /api/matakuliah/:id/sessions  - list sessions
router.get('/:id/sessions', async (req, res) => {
  try {
    const sessions = await Session.find({ mataKuliahId: req.params.id })
      .sort('session');
    res.json(sessions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal memuat sesi.' });
  }
});

module.exports = router;
