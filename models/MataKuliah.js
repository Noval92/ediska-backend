const mongoose = require('mongoose');

const mataKuliahSchema = new mongoose.Schema({
  userId: { type: mongoose.Types.ObjectId, ref: 'User', required: true },
  semester: { type: Number, required: true },
  nama:     { type: String, required: true },
  kode:     { type: String, required: true },
  sks:      { type: Number, required: true }
}, { timestamps: true });

module.exports = mongoose.model('MataKuliah', mataKuliahSchema);
