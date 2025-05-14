const mongoose = require('mongoose');

const semesterSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  semester: { type: Number, required: true },
  sks: { type: Number, required: true },
  periode: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Semester', semesterSchema);
