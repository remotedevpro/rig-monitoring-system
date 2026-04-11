const fs = require('fs');
const path = require('path');

// 📁 Define log file path
const logDir = path.join(__dirname, '../logs');
const logFilePath = path.join(logDir, 'rig_logs.csv');

// 📁 Ensure logs directory exists
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
}

// 📄 Create CSV file with headers if not exists
if (!fs.existsSync(logFilePath)) {
    fs.writeFileSync(
        logFilePath,
        "timestamp,depth,rpm,hookload,pressure,status,message\n"
    );
}

// 📝 Function to log data
const logToCSV = (data, status, message) => {
    const logEntry = `${new Date().toISOString()},${data.depth || ''},${data.rpm || ''},${data.hookload || ''},${data.pressure || ''},${status},${message}\n`;

    fs.appendFile(logFilePath, logEntry, (err) => {
        if (err) {
            console.error("❌ Log write error:", err);
        }
    });
};

module.exports = logToCSV;