const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

const studentRoutes = require('./routes/studentRoutes');
const authRoutes    = require('./routes/authRoutes');
const semesterRoutes = require('./routes/semesterRoutes');

const app = express();

// 1) Pasang CORS **di paling atas**, sebelum app.use(express.json()) atau route apa pun:
app.use(cors({
  origin: 'https://ediska-frontend.vercel.app', // ganti sesuai domain front-end mu
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization']
}));
app.options('*', cors()); // handle preflight

// 2) Kemudian middleware lain
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// 3) Baru daftarkan semua route
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/semester', semesterRoutes);

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("Connected to MongoDB Atlas"))
.catch(err => console.error("MongoDB connection error:", err));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
