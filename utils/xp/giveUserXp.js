const calculateLevelXp = require('./calculateLevelXp');
const db = require('../database');
const logger = require('../logger');

module.exports = {
  async addXp(userData) {
    try {
      const newData = { 
        ...userData, 
        xp: userData.xp + 15,
        totalXp: (userData.totalXp || 0) + 15
      };
      return this.checkLevelUp(newData);
    } catch (error) {
      logger.error(`XP Error: ${error}`);
      return userData;
    }
  },

  checkLevelUp(userData) {
    const needed = calculateLevelXp(userData.level + 1);
    if (userData.xp >= needed) {
      return {
        ...userData,
        level: userData.level + 1,
        xp: userData.xp - needed
      };
    }
    return userData;
  }
};