const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

const studentRoutes = require('./routes/studentRoutes');
const authRoutes = require('./routes/authRoutes');
const semesterRoutes = require('./routes/semesterRoutes'); // kalau ada

const app = express();

// Konfigurasi CORS untuk mengizinkan preflight (OPTIONS)
app.use(cors({
  origin: '*',
  methods: ['GET','POST','PUT','DELETE','PATCH','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization']
}));
app.options('*', cors());

app.use(express.json());
app.use('/uploads', express.static('uploads'));
app.use('/api/students', studentRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/semester', semesterRoutes);

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("Connected to MongoDB Atlas"))
.catch((err) => console.error("MongoDB connection error:", err));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
