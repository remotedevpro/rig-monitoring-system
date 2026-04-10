const RigData = require('../models/rigModel');

// Get all rig data
const getRigData = async (req, res) => {
    try {
        const data = await RigData.find().sort({ timestamp: -1 });
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Add new rig reading

const addRigData = async (req, res) => {
    try {
        const { depth, rpm, hookload, pressure } = req.body;

        // 🔥 VALIDATION
        if (
            depth == null ||
            rpm == null ||
            hookload == null ||
            pressure == null
        ) {
            return res.status(400).json({ message: "All fields are required" });
            
        }

        if (
            typeof depth !== 'number' ||
            typeof rpm !== 'number' ||
            typeof hookload !== 'number' ||
            typeof pressure !== 'number'
        ) {
            return res.status(400).json({ message: "All values must be numbers" });
        
        }

        const newReading = new RigData({
            depth,
            rpm,
            hookload,
            pressure
        });

        await newReading.save();

        res.status(201).json(newReading);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
module.exports = { getRigData, addRigData };