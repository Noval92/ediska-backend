const express = require('express');
const router = express.Router();
const MataKuliah = require('../models/MataKuliah');

// Simpan mata kuliah baru
router.post('/', async (req, res) => {
  try {
    const { userId, semester, nama, kode, sks } = req.body;
    const mk = new MataKuliah({ userId, semester, nama, kode, sks });
    await mk.save();
    res.json(mk);
  } catch (err) {
    res.status(500).json({ error: 'Gagal menyimpan mata kuliah.' });
  }
});

// Ambil daftar mata kuliah user per semester
router.get('/', async (req, res) => {
  try {
    const { userId, semester } = req.query;
    const list = await MataKuliah.find({ userId, semester });
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: 'Gagal mengambil mata kuliah.' });
  }
});

// Hapus mata kuliah
router.delete('/:id', async (req, res) => {
  try {
    await MataKuliah.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Gagal menghapus mata kuliah.' });
  }
});

module.exports = router;
