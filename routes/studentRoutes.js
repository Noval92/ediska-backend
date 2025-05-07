const express = require('express');
const multer = require('multer');
const Student = require('../models/Student');

const router = express.Router();

const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}_${file.originalname}`);
  },
});
const upload = multer({ storage });

router.post('/', upload.single('dokumen'), async (req, res) => {
  try {
    const { nim, nama, semester } = req.body;
    const dokumenPath = req.file.path;
    const student = new Student({ nim, nama, semester, dokumenPath });
    await student.save();
    res.json({ message: 'Data berhasil disimpan!' });
  } catch (err) {
    res.status(500).json({ error: 'Gagal menyimpan data.' });
  }
});

module.exports = router;
