// models/MataKuliahSesi.js
const mongoose = require('mongoose');

const sesiSchema = new mongoose.Schema({
  matkulId: { type: mongoose.Schema.Types.ObjectId, ref: 'MataKuliah', required: true },
  pelajaran: { type: String, required: true },
  materiFile: { type: String, default: '' }, // path file
  materiJudul: { type: String, default: '' },
  lainFile: { type: String, default: '' },   // path file
  lainJudul: { type: String, default: '' },
  nilai: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('MataKuliahSesi', sesiSchema);
