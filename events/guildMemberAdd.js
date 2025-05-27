const { EmbedBuilder } = require('discord.js');

module.exports = async (client, member) => {
  const channel = member.guild.channels.cache.get(process.env.WELCOME_CHANNEL_ID);
  if (!channel) return;

  const embed = new EmbedBuilder()
    .setTitle(`🎉 Bienvenue ${member.user.username} !`)
    .setDescription(`Tu es le ${member.guild.memberCount}ème membre !`)
    .setColor('#00FF00');

  channel.send({ embeds: [embed] });
};