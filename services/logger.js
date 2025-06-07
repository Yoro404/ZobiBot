import fs from 'fs';
import path from 'path';

const logDir = path.resolve('logs');
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
const logFile = path.join(logDir, 'bot.log');

function logToFile(message) {
  fs.appendFileSync(logFile, `[${new Date().toISOString()}] ${message}\n`);
}

const logger = {
  info: (msg) => {
    const line = `[INFO] ${msg}`;
    console.log(line);
    logToFile(line);
  },
  warn: (msg) => {
    const line = `[WARN] ${msg}`;
    console.warn(line);
    logToFile(line);
  },
  error: (err) => {
    const line = `[ERROR] ${err?.stack || err}`;
    console.error(line);
    logToFile(line);
  }
};

export default logger;
