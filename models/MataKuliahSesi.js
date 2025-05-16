// models/MataKuliahSesi.js
const mongoose = require('mongoose');

const sesiSchema = new mongoose.Schema({
  matkulId: { type: mongoose.Schema.Types.ObjectId, ref: 'MataKuliah', required: true },

  pelajaran: { type: String, required: true },
  ringkasan: { type: String, default: '' },

  pdf: [{ type: String }],            // path PDF file
  pdfJudul: [{ type: String }],

  videoLink: [{ type: String }],
  videoJudul: [{ type: String }],

  nilai: { type: Number, default: null }
}, { timestamps: true });

module.exports = mongoose.model('MataKuliahSesi', sesiSchema);
