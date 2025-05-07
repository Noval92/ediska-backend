const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const studentRoutes = require('./routes/studentRoutes');
const authRoutes = require('./routes/authRoutes'); // Tambahan auth route

const app = express();
app.use(cors());
app.use(express.json()); // Agar bisa baca body JSON dari login/signup
app.use('/uploads', express.static('uploads'));
app.use('/api/students', studentRoutes);
app.use('/api/auth', authRoutes); // Route login/register

// Koneksi ke MongoDB Atlas
mongoose.connect('mongodb+srv://nurimansyahnoval:Noval224425%21@e-diska.mfvlszi.mongodb.net/arsip_mahasiswa?retryWrites=true&w=majority&appName=E-diska', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("Connected to MongoDB Atlas"))
.catch((err) => console.error("MongoDB connection error:", err));

// Jalankan server
app.listen(3000, () => console.log('Server running on http://localhost:3000'));
