const { createWriteStream, existsSync, mkdirSync } = require('fs');
const path = require('path');

// Crée le dossier "logs" s'il n'existe pas
const logDir = path.join(__dirname, '..', 'logs'); // Chemin vers ./logs
if (!existsSync(logDir)) {
  mkdirSync(logDir, { recursive: true });
}

const logStream = createWriteStream(path.join(logDir, 'bot.log'), { flags: 'a' });

module.exports = {
  log: (message) => {
    const logMessage = `[${new Date().toISOString()}] ${message}\n`;
    console.log(logMessage);
    logStream.write(logMessage);
  },
  error: (error) => {
    const message = `[ERREUR] ${error.stack || error}`;
    module.exports.log(message); // Correction : utilisez module.exports au lieu de "this"
  }
};