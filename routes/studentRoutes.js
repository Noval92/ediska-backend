const express = require('express');
const router = express.Router();
const multer = require('multer');
const Student = require('../models/Student');

// Setup penyimpanan Multer untuk foto profil
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // folder penyimpanan file
  },
  filename: function (req, file, cb) {
    const ext = file.originalname.split('.').pop();
    cb(null, 'foto-' + Date.now() + '.' + ext);
  }
});

const upload = multer({ storage: storage });

// ===========================
// ENDPOINT UPDATE PROFIL + FOTO
// ===========================

/**
 * @route   PUT /api/students/:id
 * @desc    Update profil mahasiswa (termasuk foto profil)
 * @access  Auth (optional)
 */
router.put('/:id', upload.single('foto'), async (req, res) => {
  try {
    // Data yang boleh diupdate
    const { nama, nim, semester, email, domisili } = req.body;
    const updateData = {};

    if (nama) updateData.nama = nama;
    if (nim) updateData.nim = nim;
    if (semester) updateData.semester = semester;
    if (email) updateData.email = email;
    if (domisili) updateData.domisili = domisili;
    if (req.file) updateData.foto = req.file.path; // Foto baru

    // Proses update
    const student = await Student.findByIdAndUpdate(req.params.id, updateData, { new: true });

    if (!student) return res.status(404).json({ error: 'Mahasiswa tidak ditemukan.' });

    res.json({
      message: 'Profil berhasil diupdate!',
      student
    });
  } catch (err) {
    res.status(500).json({ error: 'Gagal update profil.' });
  }
});

module.exports = router;
