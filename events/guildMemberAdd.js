import { EmbedBuilder } from 'discord.js';
import logger from '../services/logger.js';

export default async (client, member) => {
  try {
    const channel = member.guild.systemChannel;
    if (!channel) return;
    const embed = new EmbedBuilder()
      .setTitle(`🎉 Bienvenue ${member.user.username} !`)
      .setDescription(`Tu es le ${member.guild.memberCount}ème membre !`)
      .setColor('#00FF00');
    await channel.send({ embeds: [embed] });
  } catch (e) {
    logger.error('Erreur guildMemberAdd: ' + e);
  }
};
