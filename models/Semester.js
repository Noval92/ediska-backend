const mongoose = require('mongoose');

const semesterSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  semester: {
    type: Number,
    required: true
  },
  sks: {
    type: Number,
    default: 0
  },
  tahun: {
    type: String,
    default: ''
  },
  parity: {
    type: String,
    default: ''
  }
}, { timestamps: true });

module.exports = mongoose.model('Semester', semesterSchema);
