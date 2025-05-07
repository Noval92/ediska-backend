const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  nim: String,
  nama: String,
  semester: Number,
  dokumenPath: String,
}, { timestamps: true });

module.exports = mongoose.model('Student', studentSchema);
