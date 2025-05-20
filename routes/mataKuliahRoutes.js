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
  const filter = {};
  if (userId) filter.userId = userId;
  if (semester) filter.semester = semester;
  const mk = await MataKuliah.find(filter);
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
  ringkasanOCR: req.body.ringkasanOCR, // <--- Tambah ini!
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
  // Pastikan bukan /sesi/:id
  if (req.params.matkulId === 'sesi') return res.status(400).json({ message: 'Invalid request' });
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
  { name: 'pdfFile[]', maxCount: 10 }
]), async (req, res) => {
  const sesi = await MataKuliahSesi.findById(req.params.id);
  if (!sesi) return res.status(404).send('Sesi tidak ditemukan');

  sesi.pelajaran = req.body.pelajaran;
  sesi.ringkasan = req.body.ringkasan;
  sesi.nilai = req.body.nilai;

  const pdfJudul = Array.isArray(req.body.pdfJudul) ? req.body.pdfJudul : [req.body.pdfJudul].filter(Boolean);
  const videoJudul = Array.isArray(req.body.videoJudul) ? req.body.videoJudul : [req.body.videoJudul].filter(Boolean);
  const videoLink = Array.isArray(req.body.videoLink) ? req.body.videoLink : [req.body.videoLink].filter(Boolean);
  const pdfFiles = (req.files['pdfFile[]'] || []).map(f => f.path);

  sesi.pdfJudul = pdfJudul;
  sesi.pdf = pdfFiles.length > 0 ? pdfFiles : sesi.pdf; // kalau ada yang baru diupload
  sesi.videoJudul = videoJudul;
  sesi.videoLink = videoLink;

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

/* ============ ENDPOINT DETAIL MATA KULIAH BY ID ============ */
// !!! PALING BAWAH !!!
router.get('/:id', async (req, res) => {
  // Agar tidak bentrok dengan /:matkulId/sesi atau /sesi/:id
  if (req.params.id === 'sesi') return res.status(400).json({ message: 'Invalid request' });
  try {
    const mk = await MataKuliah.findById(req.params.id);
    if (!mk) return res.status(404).json({ message: 'Mata Kuliah tidak ditemukan' });
    res.json(mk);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
