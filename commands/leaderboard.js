import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import db from '../services/database.js';

export default {
  data: new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('Affiche le classement des membres les plus actifs')
    .addIntegerOption(option =>
      option.setName('limit').setDescription('Nombre de membres à afficher (1-20)').setMinValue(1).setMaxValue(20).setRequired(false)),

  async execute(interaction) {
    await interaction.deferReply();
    const limit = interaction.options.getInteger('limit') || 10;
    const guildId = interaction.guild.id;
    try {
      const topUsers = await db.getTopUsers(guildId, limit);
      if (!topUsers || !topUsers.length) {
        return interaction.editReply({ content: '❌ Aucune donnée XP disponible.' });
      }
      const embed = new EmbedBuilder()
        .setTitle(`🏆 Classement des ${limit} meilleurs membres`)
        .setColor(0xFFD700)
        .setThumbnail(interaction.guild.iconURL())
        .setDescription(`Classement XP du serveur ${interaction.guild.name}`)
        .setFooter({ text: `Mis à jour`, iconURL: interaction.client.user.displayAvatarURL() })
        .setTimestamp();
      topUsers.forEach((user, idx) => {
        const medal = idx < 3 ? ['🥇','🥈','🥉'][idx] : `#${idx+1}`;
        embed.addFields({
          name: `${medal} ${user.username}`,
          value: `└ Niveau ${user.level} • ${user.totalXp} XP`,
          inline: false
        });
      });
      if (!topUsers.some(u => u.userId === interaction.user.id)) {
        const userData = await db.getUserWithRank(interaction.user.id, guildId);
        if (userData) {
          embed.addFields({
            name: '\u200b',
            value: `\n**Votre position**\n#${userData.rank} • Niveau ${userData.level} • ${userData.totalXp} XP`,
            inline: false
          });
        }
      }
      await interaction.editReply({ embeds: [embed] });
    } catch (e) {
      await interaction.editReply({ content: '❌ Erreur génération du classement.' });
    }
  }
};
