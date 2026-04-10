require('dotenv').config(); // MUST be at top

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const rigRoutes = require('./routes/rigRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Test route
app.get('/', (req, res) => {
    res.send('NURAB Systems Rig Monitoring System API is running...');
});

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => {
      console.error('❌ MongoDB connection error:');
      console.error(err.message);
  });

// Routes (ONLY ONE)
app.use('/api/rig-data', rigRoutes);

// Port
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});