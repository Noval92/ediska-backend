const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const MataKuliah = require('../models/MataKuliah');
const MataKuliahSesi = require('../models/MataKuliahSesi');

// === SETUP UPLOAD FILE ===
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = 'uploads/';
    if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath);
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '_'));
  }
});
const upload = multer({ storage: storage });

/* ============ ENDPOINT MATA KULIAH ============ */

// List mata kuliah per user & semester
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

// Hapus mata kuliah + hapus semua sesi-nya
router.delete('/:id', async (req, res) => {
  await MataKuliah.findByIdAndDelete(req.params.id);
  await MataKuliahSesi.deleteMany({ matkulId: req.params.id });
  res.sendStatus(200);
});

/* ============ ENDPOINT SESI MATA KULIAH ============ */

// Tambah sesi
router.post('/sesi', upload.fields([
  { name: 'pdfFile[]', maxCount: 10 },
  { name: 'pdfJudul[]' },
  { name: 'videoJudul[]' },
  { name: 'videoLink[]' }
]), async (req, res) => {
  const {
    matkulId,
    pelajaran,
    ringkasan,
    nilai,
    pdfJudul = [],
    videoJudul = [],
    videoLink = []
  } = req.body;

  const pdfFiles = [];
  const pdfJudulArr = Array.isArray(pdfJudul) ? pdfJudul : [pdfJudul];
  const videoJudulArr = Array.isArray(videoJudul) ? videoJudul : [videoJudul];
  const videoLinkArr = Array.isArray(videoLink) ? videoLink : [videoLink];

  const pdfFileList = req.files['pdfFile[]'] || [];
  for (let i = 0; i < pdfFileList.length; i++) {
    pdfFiles.push(pdfFileList[i].path);
  }

  const sesi = await MataKuliahSesi.create({
    matkulId,
    pelajaran,
    ringkasan,
    nilai,
    pdf: pdfFiles,
    pdfJudul: pdfJudulArr,
    videoLink: videoLinkArr,
    videoJudul: videoJudulArr
  });

  res.json(sesi);
});

// Ambil semua sesi dari satu matkul
router.get('/:matkulId/sesi', async (req, res) => {
  const list = await MataKuliahSesi.find({ matkulId: req.params.matkulId });
  res.json(list);
});

// Ambil sesi berdasarkan ID
router.get('/sesi/:id', async (req, res) => {
  const sesi = await MataKuliahSesi.findById(req.params.id);
  if (!sesi) return res.status(404).send('Sesi tidak ditemukan');
  res.json(sesi);
});

// Update sesi
router.put('/sesi/:id', upload.fields([
  { name: 'materiFile', maxCount: 1 },
  { name: 'lainFile', maxCount: 1 }
]), async (req, res) => {
  const sesi = await MataKuliahSesi.findById(req.params.id);
  if (!sesi) return res.status(404).send('Sesi tidak ditemukan');

  sesi.pelajaran = req.body.pelajaran;
  sesi.materiJudul = req.body.materiJudul;
  sesi.lainJudul = req.body.lainJudul;
  sesi.nilai = req.body.nilai;

  if (req.files['materiFile']) {
    sesi.materiFile = req.files['materiFile'][0].path;
  }
  if (req.files['lainFile']) {
    sesi.lainFile = req.files['lainFile'][0].path;
  }

  await sesi.save();
  res.send('Sesi berhasil diperbarui');
});

// Hapus sesi berdasarkan ID
router.delete('/sesi/:id', async (req, res) => {
  try {
    await MataKuliahSesi.findByIdAndDelete(req.params.id);
    res.json({ message: 'Sesi berhasil dihapus.' });
  } catch (err) {
    res.status(500).json({ error: 'Gagal menghapus sesi.' });
  }
});

module.exports = router;
