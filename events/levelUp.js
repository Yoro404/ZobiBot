import config from '../config/config.js';
import logger from '../services/logger.js';

/**
 * @param {*} client 
 * @param {*} member 
 * @param {*} newLevel 
 * @param {*} sessionResult
 */
export default async (client, member, newLevel, sessionResult = null) => {
  try {
    const rolesToGive = config.roles.filter(r => r.level <= newLevel).map(r => r.roleId);
    const toAdd = rolesToGive.filter(roleId => !member.roles.cache.has(roleId));
    if (toAdd.length) {
      await member.roles.add(toAdd).catch(() => {});
    }
    await member.send(
      `🎉 Tu as atteint le niveau ${newLevel} !` +
      (sessionResult ? `\n⏱️ Temps vocal: ${Math.floor(sessionResult.duration/60)}m, XP: +${sessionResult.xpEarned}` : '')
    ).catch(() => {});
  } catch (e) {
    logger.error('Erreur levelUp: ' + e);
  }
};
