const express = require('express');
const router = express.Router();
const Semester = require('../models/Semester');
const MataKuliah = require('../models/MataKuliah');

// Get semua semester milik user
router.get('/:userId', async (req, res) => {
  try {
    const semesters = await Semester.find({ userId: req.params.userId });
    res.json(semesters);
  } catch (err) {
    res.status(500).json({ error: 'Gagal mengambil data semester.' });
  }
});

// Tambah/Update semester
router.post('/', async (req, res) => {
  const { userId, semester, sks, tahun, parity } = req.body;
  try {
    let sem = await Semester.findOne({ userId, semester });
    if (sem) {
      sem.sks = sks;
      sem.tahun = tahun;
      sem.parity = parity;
      await sem.save();
    } else {
      sem = await Semester.create({ userId, semester, sks, tahun, parity });
    }
    res.json(sem);
  } catch (err) {
    res.status(500).json({ error: 'Gagal menyimpan data semester.' });
  }
});

// Hapus semester + semua matkul semester tsb
router.delete('/:id', async (req, res) => {
  try {
    const semester = await Semester.findById(req.params.id);
    if (!semester) return res.status(404).json({ error: 'Semester tidak ditemukan' });

    await semester.deleteOne();
    await MataKuliah.deleteMany({ userId: semester.userId, semester: semester.semester });

    res.json({ message: 'Semester dan semua matkul semester ini dihapus.' });
  } catch (err) {
    res.status(500).json({ error: 'Gagal menghapus semester.' });
  }
});

module.exports = router;
