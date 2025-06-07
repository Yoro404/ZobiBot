import logger from './logger.js';
import calculateLevelXp from '../utils/calculateLevelXp.js';

const messageCooldowns = new Map();
const COOLDOWN_TIME = 60 * 1000; 
const BASE_XP_GAIN = 15;
const RANDOM_XP_BONUS = 10;

const xpManager = {
  /**
   * @param {Object} userData 
   * @param {number} bonusXp 
   * @returns {Object} 
   */
  async addXp(userData, bonusXp = 0) {
    try {
      if (bonusXp === 0) {
        const userId = userData.userId;
        const now = Date.now();
        const lastXpTime = messageCooldowns.get(userId);
        if (lastXpTime && now - lastXpTime < COOLDOWN_TIME) return userData;
        messageCooldowns.set(userId, now);
      }

      const randomBonus = Math.floor(Math.random() * RANDOM_XP_BONUS);
      const xpToAdd = bonusXp || (BASE_XP_GAIN + randomBonus);
      let updatedData = {
        ...userData,
        xp: (userData.xp || 0) + xpToAdd,
        totalXp: (userData.totalXp || 0) + xpToAdd
      };
      updatedData = xpManager.checkLevelUp(updatedData);
      return updatedData;
    } catch (error) {
      logger.error(`Erreur addXp: ${error}`);
      return userData;
    }
  },
  checkLevelUp(userData) {
    try {
      let currentLevel = userData.level || 1;
      let currentXp = userData.xp || 0;
      let leveledUp = false;
      while (true) {
        const xpNeeded = calculateLevelXp(currentLevel + 1);
        if (currentXp >= xpNeeded) {
          currentLevel++;
          currentXp -= xpNeeded;
          leveledUp = true;
        } else break;
      }
      return { ...userData, level: currentLevel, xp: currentXp, leveledUp };
    } catch (e) {
      logger.error(`Erreur checkLevelUp: ${e}`);
      return userData;
    }
  },
  getTotalXpForLevel(level) {
    let totalXp = 0;
    for (let i = 1; i < level; i++) totalXp += calculateLevelXp(i + 1);
    return totalXp;
  },
  getLevelFromTotalXp(totalXp) {
    let level = 1, currentTotalXp = 0;
    while (currentTotalXp <= totalXp) {
      const nextLevelXp = calculateLevelXp(level + 1);
      if (currentTotalXp + nextLevelXp > totalXp) break;
      currentTotalXp += nextLevelXp;
      level++;
    }
    return { level, currentXp: totalXp - currentTotalXp, xpForNext: calculateLevelXp(level + 1) };
  },
  async addVoiceXp(userId, durationInSeconds) {
    try {
      const minutes = Math.floor(durationInSeconds / 60);
      if (minutes < 1) return 0;
      return Math.min(minutes * 2, 30); 
    } catch (e) {
      logger.error(`Erreur addVoiceXp: ${e}`);
      return 0;
    }
  },
  cleanupCooldowns() {
    const now = Date.now();
    for (const [userId, timestamp] of messageCooldowns.entries()) {
      if ((now - timestamp) > COOLDOWN_TIME * 2) messageCooldowns.delete(userId);
    }
  }
};

setInterval(() => xpManager.cleanupCooldowns(), 10 * 60 * 1000);

export default xpManager;
