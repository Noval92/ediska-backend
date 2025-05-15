const express = require('express');
const router = express.Router();
const Semester = require('../models/Semester');

// Get all semesters for a user
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const semesters = await Semester.find({ userId }).sort('semester');
    res.json(semesters);
  } catch (err) {
    res.status(500).json({ error: 'Gagal memuat data semester.' });
  }
});

// Create or update semester data
router.post('/', async (req, res) => {
  try {
    const { userId, semester, sks, tahun, parity } = req.body;
    let record = await Semester.findOne({ userId, semester });
    if (record) {
      record.sks = sks;
      record.tahun = tahun;
      record.parity = parity;
      await record.save();
      return res.json({ message: 'Semester diperbarui', record });
    }
    record = new Semester({ userId, semester, sks, tahun, parity });
    await record.save();
    res.json({ message: 'Semester disimpan', record });
  } catch (err) {
    res.status(500).json({ error: 'Gagal menyimpan data semester.' });
  }
});

// Delete semester record (reset)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await Semester.findByIdAndDelete(id);
    res.json({ message: 'Semester dihapus' });
  } catch (err) {
    res.status(500).json({ error: 'Gagal menghapus data semester.' });
  }
});

module.exports = router;
