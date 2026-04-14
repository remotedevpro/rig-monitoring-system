const mongoose = require('mongoose');
const RigData = require('../models/rigModel');
const logToCSV = require('../utils/logger');
 // new system logger
const logger = require('../utils/systemLogger'); 

// CREATE BUFFER
// This buffer will hold incoming data temporarily before it's saved to the database. It allows us to manage data flow and handle cases where the database might be temporarily unavailable. When new data comes in, we add it to the buffer. A separate process can then periodically attempt to save buffered data to the database, ensuring that we don't lose any readings even if there are temporary issues with the database connection.
// This approach also allows us to implement retry logic for failed database saves, improving the robustness of our data handling. The buffer can be implemented as an array or a more sophisticated data structure depending on the needs of the application.
// 🔥 In-memory buffer
let buffer = [];

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

        // ✅ Validation
        // This validation checks for the presence of all required fields and ensures they are of the correct data type (numbers). If any validation fails, it logs the error using the system logger and also logs the details to a CSV file for further analysis. The client receives a clear error message indicating what went wrong, whether it's missing fields or invalid data types.
        // ❌ Missing fields
        if (
            depth == null ||
            rpm == null ||
            hookload == null ||
            pressure == null
        ) {
            logger.error("ERROR", "Missing fields");
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
            logger.error("ERROR", "Invalid data types");
            logToCSV(req.body, "ERROR", "Invalid data types");
            return res.status(400).json({
                message: "All values must be numbers"
            });
        }

        // 🔥 DB CHECK
        if (mongoose.connection.readyState !== 1) {
            logger.error("⚠️ DB down → buffering data");

            buffer.push({
                depth,
                rpm,
                hookload,
                pressure,
                timestamp: new Date()
            });

            return res.status(202).json({
                message: "DB unavailable → data buffered",
                bufferSize: buffer.length
            });
        }

        
        // ✅ Create new record and save to DB
        // This creates a new instance of the RigData model with the validated data and attempts to save it to MongoDB. If the database is unavailable, it logs the issue and buffers the data instead. Upon successful save, it emits a real-time update to all connected clients using Socket.io, allowing them to receive the new reading immediately without needing to refresh or poll for updates.
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

       // if (mongoose.connection.readyState !== 1) {
         //   console.log("⚠️ DB not connected. Skipping save.");

           // return res.status(503).json({
                message: "Database unavailable. Try again shortly."
           // });
       // }

        // ✅ Save to MongoDB
        await newReading.save();

        // 🔥 REAL-TIME EMIT (THIS IS THE NEW PART)
        const io = req.app.get('io');
        io.emit('rigDataUpdate', newReading);

        // ✅ Log success
        logger.info("✅ Data saved to DB");
        logToCSV(newReading, "SUCCESS", "Data saved");

        console.log("✅ Data saved:", newReading);

        // ✅ Send response
        res.status(201).json(newReading);

    } catch (error) {
        logger.error(`🔥 Server Error: ${error.message}`);
        logToCSV({}, "ERROR", error.message);

        console.error("🔥 Server Error:", error.message);

        res.status(500).json({
            message: error.message
        });
    }
};

//BUFFER FLUSH FUNCTION
// This function attempts to save all buffered data to the database. It iterates through the buffer, trying to save each entry. If a save is successful, it removes that entry from the buffer. If a save fails (e.g., due to a temporary database issue), it logs the error and leaves the entry in the buffer for future retry attempts. This function can be called periodically (e.g., every minute) using setInterval to ensure that buffered data is eventually saved once the database connection is restored.
const flushBuffer = async (io) => {
    if (buffer.length === 0) return;

    logger.info(`🔁 Flushing ${buffer.length} buffered records...`);

    while (buffer.length > 0) {
        const data = buffer.shift();

        try {
            const newReading = new RigData(data);
            await newReading.save();

            io.emit('rigDataUpdate', newReading);

            logToCSV(newReading, "SUCCESS", "Buffered data saved");

        } catch (err) {
            logger.error(`❌ Flush error: ${err.message}`);

            // Put back if failed
            buffer.unshift(data);
            break;
        }
    }
};

module.exports = {
    getRigData,
    addRigData,
    flushBuffer
};