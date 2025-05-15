const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Types.ObjectId, ref: 'User', required: true },
  mataKuliahId: { type: mongoose.Types.ObjectId, ref: 'MataKuliah', required: true },
  session: { type: Number, required: true },
  pelajaran: { type: String },
  materiFile: { type: String },
  materiJudul: { type: String },
  fileLain: { type: String },
  fileLainJudul: { type: String },
  ringkasan: { type: String },
  tugasFile: { type: String },
  tugasLink: { type: String },
  nilai: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('MatakuliahSession', sessionSchema);
