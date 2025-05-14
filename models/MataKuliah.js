const mongoose = require('mongoose');

const mataKuliahSchema = new mongoose.Schema({
  semesterId: { type: mongoose.Schema.Types.ObjectId, ref: 'Semester', required: true },
  nama: String,
  kode: String,
  sks: Number,
  sesi: Number,
  pdf: {
    materi: String,
    kuis: String,
    diskusi: String,
    tugas: String
  }
}, { timestamps: true });

module.exports = mongoose.model('MataKuliah', mataKuliahSchema);
