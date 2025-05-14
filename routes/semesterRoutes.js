const express = require('express');
const Semester = require('../models/Semester');
const router = express.Router();

// Simpan semester
router.post('/', async (req, res) => {
  try {
    const { userId, semester, sks, periode } = req.body;

    const exists = await Semester.findOne({ userId, semester });
    if (exists) return res.status(400).json({ error: 'Semester sudah ada.' });

    const newData = new Semester({ userId, semester, sks, periode });
    await newData.save();

    res.json({ message: 'Semester disimpan', data: newData });
  } catch (err) {
    res.status(500).json({ error: 'Gagal menyimpan semester' });
  }
});

// Ambil semua semester user
router.get('/:userId', async (req, res) => {
  try {
    const data = await Semester.find({ userId: req.params.userId }).sort({ semester: 1 });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Gagal mengambil data semester' });
  }
});

// Edit semester
router.put('/:id', async (req, res) => {
  try {
    const { semester, sks, periode } = req.body;
    const updated = await Semester.findByIdAndUpdate(req.params.id, { semester, sks, periode }, { new: true });
    res.json({ message: 'Semester diperbarui', data: updated });
  } catch (err) {
    res.status(500).json({ error: 'Gagal memperbarui semester' });
  }
});

// Hapus semester
router.delete('/:id', async (req, res) => {
  try {
    await Semester.findByIdAndDelete(req.params.id);
    res.json({ message: 'Semester dihapus' });
  } catch (err) {
    res.status(500).json({ error: 'Gagal menghapus semester' });
  }
});

module.exports = router;
