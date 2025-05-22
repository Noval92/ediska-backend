const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  nama: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  nim: {
    type: String
  },
  fakultas: {
    type: String
  },
  foto: {
    type: String
  },
  // TAMBAHKAN INI:
  nohp: { type: String, default: '' },
  domisili: { type: String, default: '' },
  semester: { type: String, default: '' }, // atau Number, bebas
});

module.exports = mongoose.model('User', userSchema);
