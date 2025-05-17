const express = require('express');
const router = express.Router();
const multer = require('multer');
const Student = require('../models/Student'); // Sesuaikan path model

// Multer setup for upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, 'foto-' + Date.now() + '.' + file.originalname.split('.').pop())
});
const upload = multer({ storage });

// GET student by id
router.get('/:id', async (req, res) => {
  try {
    const data = await Student.findById(req.params.id).lean();
    if (!data) return res.status(404).json({ error: 'Mahasiswa tidak ditemukan' });
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// PUT update student
router.put('/:id', upload.single('foto'), async (req, res) => {
  try {
    const updateData = { ...req.body };
    if (req.file) updateData.foto = req.file.path;
    // Pastikan email tidak bisa diubah!
    delete updateData.email;

    const updated = await Student.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!updated) return res.status(404).json({ error: 'Mahasiswa tidak ditemukan' });
    res.json(updated);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
