const config = require('../config/roles.json');

module.exports = async (client, member, newLevel) => {
  const eligibleRoles = config.filter(r => r.level <= newLevel).map(r => r.roleId);
  
  try {
    await member.send(`🎉 Level ${newLevel} atteint !`).catch(() => {});
  } catch {} // Ignore les erreurs de DM
};