// backend/server.js

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

const authRoutes     = require('./routes/authRoutes');
const studentRoutes  = require('./routes/studentRoutes');
const semesterRoutes = require('./routes/semesterRoutes');
const matkulRoutes   = require('./routes/mataKuliahRoutes'); // jika sudah ada

const app = express();

// 1) Aktifkan CORS untuk semua origin (development/testing)
app.use(cors());
// — Jika ingin whitelist beberapa domain saja, ganti dengan:
// app.use(cors({
//   origin: [
//     'https://ediska-frontend.vercel.app',
//     'https://main-novals-projects-0d98e2f2.vercel.app'
//   ]
// }));

app.options('*', cors()); // handle preflight OPTIONS

// 2) Middleware
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// 3) Routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/semester', semesterRoutes);
app.use('/api/matakuliah', matkulRoutes); // jika sudah membuat route ini

// 4) Koneksi MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("Connected to MongoDB Atlas"))
.catch(err => console.error("MongoDB connection error:", err));

// 5) Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
