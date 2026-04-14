const winston = require('winston');
const fs = require('fs');
const path = require('path');

// 📁 Log directory
const logDir = path.join(__dirname, '../logs');

// Ensure log directory exists
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
}

// 🧠 Create logger
const systemLogger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(({ timestamp, level, message }) => {
            return `${timestamp} [${level.toUpperCase()}]: ${message}`;
        })
    ),
    transports: [
        new winston.transports.File({
            filename: path.join(logDir, 'system-error.log'),
            level: 'error'
        }),
        new winston.transports.File({
            filename: path.join(logDir, 'system-combined.log')
        })
    ]
});

// Also log to console (for development)
systemLogger.add(new winston.transports.Console());

module.exports = systemLogger;