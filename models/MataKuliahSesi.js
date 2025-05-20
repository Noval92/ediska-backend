const mongoose = require('mongoose');

const sesiSchema = new mongoose.Schema({
  matkulId: { type: mongoose.Schema.Types.ObjectId, ref: 'MataKuliah', required: true },

  pelajaran: { type: String, required: true },
  ringkasan: { type: String, default: '' },
  ringkasanOCR: { type: String, default: '' }, // Tambahkan field ini

  pdf: [{ type: String }],
  pdfJudul: [{ type: String }],
  videoLink: [{ type: String }],
  videoJudul: [{ type: String }],
  nilai: { type: Number, default: null }
}, { timestamps: true });

module.exports = mongoose.model('MataKuliahSesi', sesiSchema);
