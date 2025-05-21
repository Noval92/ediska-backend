const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();
require('./models/MataKuliahSesi');
const User = require('./models/User'); // ⬅️ Tambahkan ini


// ===== Import semua routes =====
const authRoutes      = require('./routes/authRoutes');
const studentRoutes   = require('./routes/studentRoutes');
const semesterRoutes  = require('./routes/semesterRoutes');
const matkulRoutes    = require('./routes/mataKuliahRoutes');

const app = express();

// ===== CORS CONFIGURATION =====
app.use(cors({
  origin: [
    'https://ediska-frontend.vercel.app', // produksi
    'http://localhost:5500'               // lokal dev
  ],
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization']
}));
app.options('*', cors());

// ===== MIDDLEWARE =====
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // ✅ fixing
app.use('/uploads', express.static('uploads'));

// ===== REGISTER ROUTES =====
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/semester', semesterRoutes);
app.use('/api/matakuliah', matkulRoutes);
const userRoutes = require('./routes/userRoutes');
app.use('/api/users', userRoutes);


// ===== CONNECT TO MONGODB ATLAS =====
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✔️ Connected to MongoDB Atlas'))
.catch(err => console.error('❌ MongoDB error:', err));

// ===== START SERVER =====
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
