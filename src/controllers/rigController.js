const mongoose = require('mongoose');
const RigData = require('../models/rigModel');
const logToCSV = require('../utils/logger');

// 📥 GET all rig data
const getRigData = async (req, res) => {
    try {
        const data = await RigData.find().sort({ timestamp: -1 });
        res.json(data);
    } catch (error) {
        console.error("🔥 Error fetching data:", error.message);
        res.status(500).json({ message: error.message });
    }
};

// 📤 POST new rig data
const addRigData = async (req, res) => {
    try {
        const { depth, rpm, hookload, pressure } = req.body;

        console.log("📥 Incoming Data:", req.body);

        // ❌ Missing fields
        if (
            depth == null ||
            rpm == null ||
            hookload == null ||
            pressure == null
        ) {
            logToCSV(req.body, "ERROR", "Missing fields");

            return res.status(400).json({
                message: "All fields are required"
            });
        }

        // ❌ Invalid data types
        if (
            typeof depth !== 'number' ||
            typeof rpm !== 'number' ||
            typeof hookload !== 'number' ||
            typeof pressure !== 'number'
        ) {
            logToCSV(req.body, "ERROR", "Invalid data types");

            return res.status(400).json({
                message: "All values must be numbers"
            });
        }

        // ✅ Create new record
        const newReading = new RigData({
            depth,
            rpm,
            hookload,
            pressure
        });

        // ENSURE DB CONNECTION BEFORE SAVING
        // Check if the database is connected before attempting to save the new reading. If not, log the error and return a 503 Service Unavailable response.
        // This prevents the server from crashing due to unhandled exceptions when the database is down and provides a clear message to the client about the issue.
        // Check MongoDB connection status
        // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
        // If not connected, skip saving and return 503
        // if (RigData.db.readyState !== 1) { .....here ,mongoose.connection == RigData.db.connection

        if (mongoose.connection.readyState !== 1) {
            console.log("⚠️ DB not connected. Skipping save.");

            return res.status(503).json({
                message: "Database unavailable. Try again shortly."
            });
        }

        // ✅ Save to MongoDB
        await newReading.save();

        // 🔥 REAL-TIME EMIT (THIS IS THE NEW PART)
        const io = req.app.get('io');
        io.emit('rigDataUpdate', newReading);

        // ✅ Log success
        logToCSV(newReading, "SUCCESS", "Data saved");

        console.log("✅ Data saved:", newReading);

        // ✅ Send response
        res.status(201).json(newReading);

    } catch (error) {
        logToCSV({}, "ERROR", error.message);

        console.error("🔥 Server Error:", error.message);

        res.status(500).json({
            message: error.message
        });
    }
};

module.exports = {
    getRigData,
    addRigData
};