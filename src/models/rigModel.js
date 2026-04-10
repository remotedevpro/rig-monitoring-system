 const mongoose = require('mongoose');

const rigSchema = new mongoose.Schema({
    depth: { type: Number, required: true },
    rpm: { type: Number, required: true },
    hookload: { type: Number, required: true },
    pressure: { type: Number, required: true },
    timestamp: { type: Date, default: Date.now }
});

// ✅ THIS LINE IS CRITICAL
module.exports = mongoose.model('RigData', rigSchema);