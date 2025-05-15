// server.js
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

// ===== CORS CONFIGURATION - DAPAT DIPERCAYA =====
const allowedOrigins = [
  'https://ediska-frontend.vercel.app',
  'http://localhost:5500'
];
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile app/postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('CORS not allowed'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
// Ini WAJIB untuk preflight CORS agar aman
app.options('*', cors());

// ===== MIDDLEWARE =====
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// ===== ROUTES =====
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/semester', semesterRoutes);
app.use('/api/matakuliah', matkulRoutes);

// ===== CONNECT DB =====
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✔️ Connected to MongoDB Atlas'))
.catch(err => console.error('❌ MongoDB error:', err));

// ===== SERVER =====
const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
