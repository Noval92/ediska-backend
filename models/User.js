const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  nama: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  nim: { type: String },
  fakultas: { type: String },
  foto: { type: String },
  nohp: { type: String },
  domisili: { type: String },
  semester: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
