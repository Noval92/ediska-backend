// backend/server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

const authRoutes      = require('./routes/authRoutes');
const studentRoutes   = require('./routes/studentRoutes');
const semesterRoutes  = require('./routes/semesterRoutes');
const matkulRoutes    = require('./routes/mataKuliahRoutes');

const app = express();

// ===== CORS CONFIGURATION =====
// Ganti origin dengan domain frontend-mu jika tidak ingin wildcard
app.use(cors({
  origin: ['https://ediska-frontend.vercel.app', 'http://localhost:5500'],
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization']
}));
// juga tangani preflight
app.options('*', cors());

app.use(express.json());
app.use('/uploads', express.static('uploads'));

// register routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/semester', semesterRoutes);
app.use('/api/matakuliah', matkulRoutes);

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✔️ Connected to MongoDB Atlas'))
.catch(err => console.error('❌ MongoDB error:', err));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
