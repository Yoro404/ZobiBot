require('dotenv').config();

module.exports = {
  token: process.env.DISCORD_TOKEN,
  prefix: process.env.PREFIX || '!',
  
  validateConfig: () => {
    if (!process.env.DISCORD_TOKEN) {
      throw new Error('[CONFIG] Token Discord manquant dans .env');
    }
  }
};