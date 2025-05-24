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

// Tambah sesi (POST)
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
    // Jangan ambil pdfJudul dll langsung dari sini, nanti diambil dari req.body di bawah
  } = req.body;

  // ------ DOKUMEN -----
  const pdfFileList = req.files['pdfFile[]'] || [];
  const pdfJudulRaw = req.body['pdfJudul[]'] || [];
  const pdfJudulArr = Array.isArray(pdfJudulRaw) ? pdfJudulRaw : [pdfJudulRaw];
  let pdf = [];
  let pdfJudul = [];
  for (let i = 0; i < pdfFileList.length; i++) {
    pdf.push(pdfFileList[i].path);
    pdfJudul.push(pdfJudulArr[i] ? pdfJudulArr[i] : `Dokumen ${i+1}`);
  }

  // ------ NOTE/LINK -----
  const videoJudulRaw = req.body['videoJudul[]'] || [];
  const videoLinkRaw = req.body['videoLink[]'] || [];
  const videoJudulArr = Array.isArray(videoJudulRaw) ? videoJudulRaw : [videoJudulRaw];
  const videoLinkArr = Array.isArray(videoLinkRaw) ? videoLinkRaw : [videoLinkRaw];

  const sesi = await MataKuliahSesi.create({
    matkulId,
    pelajaran,
    ringkasan,
    ringkasanOCR: req.body.ringkasanOCR,
    nilai,
    pdf,
    pdfJudul,
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

// Update sesi (PUT)
router.put('/sesi/:id', upload.fields([
  { name: 'pdfFile[]', maxCount: 10 }
]), async (req, res) => {
  const sesi = await MataKuliahSesi.findById(req.params.id);
  if (!sesi) return res.status(404).send('Sesi tidak ditemukan');

  sesi.pelajaran = req.body.pelajaran;
  sesi.ringkasan = req.body.ringkasan;
  sesi.nilai = req.body.nilai;
  sesi.ringkasanOCR = req.body.ringkasanOCR;

  // Handle dokumen update
  const pdfFileList = req.files['pdfFile[]'] || [];
  const pdfJudulRaw = req.body['pdfJudul[]'] || [];
  const pdfJudulArr = Array.isArray(pdfJudulRaw) ? pdfJudulRaw : [pdfJudulRaw];

  let pdf = sesi.pdf;
  let pdfJudul = sesi.pdfJudul;
  if (pdfFileList.length > 0) {
    // Update file dan judul hanya jika upload baru
    pdf = [];
    pdfJudul = [];
    for (let i = 0; i < pdfFileList.length; i++) {
      pdf.push(pdfFileList[i].path);
      pdfJudul.push(pdfJudulArr[i] ? pdfJudulArr[i] : `Dokumen ${i+1}`);
    }
    sesi.pdf = pdf;
    sesi.pdfJudul = pdfJudul;
  } else if (pdfJudulArr.length > 0) {
    // Jika tidak upload file baru, update judul jika ada
    sesi.pdfJudul = pdfJudulArr;
  }

  // Note/Link
  const videoJudulRaw = req.body['videoJudul[]'] || [];
  const videoLinkRaw = req.body['videoLink[]'] || [];
  sesi.videoJudul = Array.isArray(videoJudulRaw) ? videoJudulRaw : [videoJudulRaw];
  sesi.videoLink = Array.isArray(videoLinkRaw) ? videoLinkRaw : [videoLinkRaw];

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
