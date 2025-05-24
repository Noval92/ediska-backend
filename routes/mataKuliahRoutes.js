const express = require('express');
const router = express.Router();

// ==== Pakai Cloudinary ==== //
const { storage, cloudinary } = require('../cloudinary'); // Tambahkan cloudinary
const multer = require('multer');
const upload = multer({ storage: storage });

const MataKuliah = require('../models/MataKuliah');
const MataKuliahSesi = require('../models/MataKuliahSesi');

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

  const pdfFiles = req.files.map(file => file.path);
  const pdfJudulRaw = req.body['pdfJudul[]'] || [];
  const pdfJudulArr = Array.isArray(pdfJudulRaw) ? pdfJudulRaw : [pdfJudulRaw];
  let pdfJudul = [];

  // Pastikan file jadi public
  for (const file of req.files) {
    await cloudinary.api.update(file.filename, {
      resource_type: 'raw',
      type: 'upload',
      access_mode: 'public'
    });
  }

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

  const pdfFiles = req.files.map(file => file.path);
  const pdfJudulRaw = req.body['pdfJudul[]'] || [];
  const pdfJudulArr = Array.isArray(pdfJudulRaw) ? pdfJudulRaw : [pdfJudulRaw];

  if (pdfFiles.length > 0) {
    sesi.pdf = pdfFiles;

    for (const file of req.files) {
      await cloudinary.api.update(file.filename, {
        resource_type: 'raw',
        type: 'upload',
        access_mode: 'public'
      });
    }

    let pdfJudul = [];
    for (let i = 0; i < pdfFiles.length; i++) {
      pdfJudul.push(pdfJudulArr[i] ? pdfJudulArr[i] : `Dokumen ${i + 1}`);
    }
    sesi.pdfJudul = pdfJudul;
  } else if (pdfJudulArr.length > 0) {
    sesi.pdfJudul = pdfJudulArr;
  }

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
