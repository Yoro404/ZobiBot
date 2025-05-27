const { giveXp } = require('../utils/xp/giveUserXp');
const db = require('../utils/database');

module.exports = async (client, oldState, newState) => {
  if (newState.channelId && !oldState.channelId) {
    // Utilisateur rejoint un vocal
    db.startVoiceSession(newState.member.id);
  } else if (!newState.channelId) {
    // Utilisateur quitte le vocal
    const session = db.endVoiceSession(newState.member.id);
    if (session) {
      const xp = Math.floor(session.duration / 5); // 1 XP toutes les 5 minutes
      await giveXp.addXp({ ...session.user, xp });
    }
  }
};