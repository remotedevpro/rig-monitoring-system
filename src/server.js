require('dotenv').config();

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const http = require('http');
const { Server } = require('socket.io');

const rigRoutes = require('./routes/rigRoutes');

const app = express();

// Create HTTP server
const server = http.createServer(app);

// Attach Socket.io
const io = new Server(server, {
    cors: {
        origin: "*"
    }
});

// Middleware
app.use(cors());
app.use(express.json());

// Test route
app.get('/', (req, res) => {
    res.send('NURAB Systems Rig Monitoring System API is running...');
});

// MongoDB connection - ADD DB CONNECTION MONITORING
mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 5000
});

const db = mongoose.connection;

db.on('connected', () => {
    console.log('✅ MongoDB connected');
});

db.on('error', (err) => {
    console.log('❌ MongoDB error:', err.message);
});

db.on('disconnected', () => {
    console.log('⚠️ MongoDB disconnected! Trying to reconnect...');
    reconnectDB();
});

// MongoDB connection - ADD AUTO-RECONNECT FUNCTION
// Connection lost → wait 5s → reconnect → continue
const reconnectDB = () => {
    setTimeout(() => {
        mongoose.connect(process.env.MONGO_URI)
            .then(() => console.log("🔁 Reconnected to MongoDB"))
            .catch(err => console.log("❌ Reconnect failed:", err.message));
    }, 5000); // retry after 5 seconds
};



// Routes
app.use('/api/rig-data', rigRoutes);

// Socket connection
io.on('connection', (socket) => {
    console.log('⚡ Client connected:', socket.id);

    socket.on('disconnect', () => {
        console.log('❌ Client disconnected:', socket.id);
    });
});

// Make io accessible globally
app.set('io', io);

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});