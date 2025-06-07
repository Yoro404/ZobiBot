import pkg from 'canvacord';
const { Rank } = pkg;
import { SlashCommandBuilder, AttachmentBuilder, EmbedBuilder } from 'discord.js';
import calculateLevelXp from '../utils/calculateLevelXp.js';
import db from '../services/database.js';

export default {
  data: new SlashCommandBuilder()
    .setName('rank')
    .setDescription('Affiche votre niveau et progression')
    .addUserOption(option =>
      option.setName('utilisateur').setDescription('Membre à vérifier').setRequired(false)),

  async execute(interaction) {
    await interaction.deferReply();
    const targetUser = interaction.options.getUser('utilisateur') || interaction.user;
    const guildId = interaction.guild.id;
    const userId = targetUser.id;
    try {
      const userData = await db.getUserWithRank(userId, guildId);
      if (!userData) {
        return interaction.editReply({ content: '❌ Données introuvables pour cet utilisateur' });
      }
      const rankCard = new Rank()
        .setAvatar(targetUser.displayAvatarURL({ size: 256, extension: 'png', forceStatic: true }))
        .setCurrentXP(userData.xp || 0)
        .setRequiredXP(calculateLevelXp(userData.level + 1))
        .setLevel(userData.level || 1)
        .setRank(userData.rank || 0)
        .setUsername(targetUser.username)
        .setBackground('COLOR', '#2b2d31')
        .setProgressBar('#FFD700', 'COLOR')
        .setOverlay('#000000', 0.3);
      const cardBuffer = await rankCard.build();
      const embed = new EmbedBuilder()
        .setColor('#FFD700')
        .setTitle(`Niveau ${userData.level} • Rang #${userData.rank}`)
        .setDescription(`**${targetUser.username}**`)
        .setImage('attachment://rank.png')
        .setFooter({ text: `XP: ${userData.xp}/${calculateLevelXp(userData.level + 1)}`, iconURL: interaction.guild.iconURL() });
      const attachment = new AttachmentBuilder(cardBuffer, { name: 'rank.png' });
      await interaction.editReply({ embeds: [embed], files: [attachment] });
    } catch (e) {
      await interaction.editReply({ content: `❌ Erreur: ${e.message}` });
    }
  }
};
