import 'dotenv/config';
import fs from 'fs';
import path from 'path';

const configPath = path.resolve('src/config/bot.json');
let fileConfig = {};
if (fs.existsSync(configPath)) {
  try {
    fileConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  } catch (e) {
    console.error('Erreur de lecture du fichier de config JSON :', e);
  }
}

const config = {
  token: process.env.DISCORD_TOKEN || process.env.TOKEN,
  clientId: process.env.CLIENT_ID || process.env.clientId || fileConfig.clientId,
  guildId: process.env.GUILD_ID || process.env.Server || fileConfig.Server,
  mongoUri: process.env.MONGODB_URI || process.env.MONGODB,
  prefix: process.env.PREFIX || fileConfig.prefix || '!',
  dev: fileConfig.dev || [],
  roles: fileConfig.roles || [],
  validate: () => {
    if (!config.token) throw new Error('[CONFIG] Token Discord manquant dans .env');
    if (!config.clientId) throw new Error('[CONFIG] ClientID manquant dans .env');
    if (!config.mongoUri) throw new Error('[CONFIG] MongoDB URI manquant dans .env');
  }
};

export default config;
