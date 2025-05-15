// routes/mataKuliahRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

const MataKuliah = require('../models/MataKuliah');
const MataKuliahSesi = require('../models/MataKuliahSesi');

// SETUP UPLOAD FOLDER
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g,'_'));
  }
});
const upload = multer({ storage: storage });

// --------- ENDPOINT API -----------

// List mata kuliah per user dan semester
router.get('/', async (req, res) => {
  const { userId, semester } = req.query;
  const mk = await MataKuliah.find({ userId, semester });
  res.json(mk);
});

// Tambah mata kuliah
router.post('/', async (req, res) => {
  const { userId, semester, nama, kode, sks } = req.body;
  const mk = await MataKuliah.create({ userId, semester, nama, kode, sks });
  res.json(mk);
});

// Hapus mata kuliah
router.delete('/:id', async (req, res) => {
  await MataKuliah.findByIdAndDelete(req.params.id);
  await MataKuliahSesi.deleteMany({ matkulId: req.params.id });
  res.sendStatus(200);
});

// --- Sesi (endpoint baru) ---

// Simpan sesi (with upload file)
router.post('/sesi', upload.fields([
  { name: 'materiFile', maxCount: 1 },
  { name: 'lainFile', maxCount: 1 }
]), async (req, res) => {
  const { matkulId, pelajaran, materiJudul, lainJudul, nilai } = req.body;
  let materiFile = '', lainFile = '';
  if (req.files['materiFile']) materiFile = req.files['materiFile'][0].path;
  if (req.files['lainFile']) lainFile = req.files['lainFile'][0].path;
  const sesi = await MataKuliahSesi.create({
    matkulId, pelajaran, materiFile, materiJudul, lainFile, lainJudul, nilai
  });
  res.json(sesi);
});

// Get semua sesi per matkul
router.get('/:matkulId/sesi', async (req, res) => {
  const list = await MataKuliahSesi.find({ matkulId: req.params.matkulId });
  res.json(list);
});

module.exports = router;
