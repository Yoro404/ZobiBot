import db from '../services/database.js';
import xpManager from '../services/xpManager.js';
import logger from '../services/logger.js';

export default async (client, message) => {
  if (message.author.bot || !message.guild) return;
  try {
    const userData = await db.getUser(message.author.id, message.guild.id, message.author.username);
    const updatedData = await xpManager.addXp(userData);
    await db.updateUser(message.author.id, message.guild.id, updatedData);
    if (updatedData.leveledUp) {
      const levelUp = (await import('./levelUp.js')).default;
      await levelUp(client, message.member, updatedData.level);
    }
  } catch (e) {
    logger.error(`Erreur XP message: ${e}`);
  }
};
