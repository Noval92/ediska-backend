// backend/server.js

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

const authRoutes       = require('./routes/authRoutes');
const studentRoutes    = require('./routes/studentRoutes');
const semesterRoutes   = require('./routes/semesterRoutes');
const matkulRoutes     = require('./routes/mataKuliahRoutes');

const app = express();

// Enable CORS for all origins
app.use(cors());
app.options('*', cors());

app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Register routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/semester', semesterRoutes);
app.use('/api/matakuliah', matkulRoutes);

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB Atlas'))
.catch(err => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
