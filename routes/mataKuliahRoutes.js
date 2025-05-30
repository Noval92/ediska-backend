const express = require('express');
const router = express.Router();
const path = require('path');
const multer = require('multer');
const fs = require('fs');

const MataKuliah = require('../models/MataKuliah');
const MataKuliahSesi = require('../models/MataKuliahSesi');

// Bikin folder uploads kalau belum ada
if (!fs.existsSync('./uploads')) fs.mkdirSync('./uploads');
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function(req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
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
router.post('/sesi', upload.array('pdfFile[]', 10), async (req, res) => {
  const { matkulId, pelajaran, ringkasan, nilai } = req.body;

  const pdfFiles = req.files.map(file => '/uploads/' + file.filename);
  const pdfJudulRaw = req.body['pdfJudul[]'] || [];
  const pdfJudulArr = Array.isArray(pdfJudulRaw) ? pdfJudulRaw : [pdfJudulRaw];
  let pdfJudul = [];

  for (let i = 0; i < pdfFiles.length; i++) {
    pdfJudul.push(pdfJudulArr[i] ? pdfJudulArr[i] : `Dokumen ${i + 1}`);
  }

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
    pdf: pdfFiles,
    pdfJudul,
    videoLink: videoLinkArr,
    videoJudul: videoJudulArr
  });

  res.json(sesi);
});

// Ambil semua sesi dari satu matkul
router.get('/:matkulId/sesi', async (req, res) => {
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
router.put('/sesi/:id', upload.array('pdfFile[]', 10), async (req, res) => {
  const sesi = await MataKuliahSesi.findById(req.params.id);
  if (!sesi) return res.status(404).send('Sesi tidak ditemukan');

  sesi.pelajaran = req.body.pelajaran;
  sesi.ringkasan = req.body.ringkasan;
  sesi.nilai = req.body.nilai;
  sesi.ringkasanOCR = req.body.ringkasanOCR;

  // ====== LOGIKA PDF BARU DAN LAMA ======

  // Ambil dokumen lama yang masih dipilih user (pdfOld dan pdfJudulOld)
  let pdfOld = req.body['pdfOld[]'] || [];
  let pdfJudulOld = req.body['pdfJudulOld[]'] || [];
  // Biar konsisten array
  if (!Array.isArray(pdfOld)) pdfOld = pdfOld ? [pdfOld] : [];
  if (!Array.isArray(pdfJudulOld)) pdfJudulOld = pdfJudulOld ? [pdfJudulOld] : [];

  // Ambil file baru dari upload
  const pdfFiles = req.files.map(file => '/uploads/' + file.filename);
  const pdfJudulRaw = req.body['pdfJudul[]'] || [];
  const pdfJudulArr = Array.isArray(pdfJudulRaw) ? pdfJudulRaw : [pdfJudulRaw];

  // Gabungkan: PDF lama yang masih dipilih + PDF baru
  const newPDF = [...pdfOld, ...pdfFiles];
  const newJudul = [...pdfJudulOld, ...pdfJudulArr];

  sesi.pdf = newPDF;
  sesi.pdfJudul = newJudul;

  // ====== END PDF ======

  // Video link/judul logic biarkan sama
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
router.get('/:id', async (req, res) => {
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
