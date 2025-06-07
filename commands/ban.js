import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Bannir un membre du serveur')
    .addUserOption(option =>
      option.setName('membre').setDescription('Membre à bannir').setRequired(true))
    .addStringOption(option =>
      option.setName('raison').setDescription('Raison du bannissement').setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .setDMPermission(false),

  async execute(interaction) {
    const member = interaction.options.getMember('membre');
    const reason = interaction.options.getString('raison') || 'Aucune raison spécifiée';
    if (!member)
      return interaction.reply({ content: '❌ Membre introuvable.', ephemeral: true });
    if (!member.bannable)
      return interaction.reply({ content: '❌ Impossible de bannir ce membre.', ephemeral: true });
    try {
      await member.ban({ reason });
      await interaction.reply(`⛔ ${member.user.tag} a été banni. Raison: ${reason}`);
      // Log modération
      const logChannel = interaction.guild.channels.cache.find(
        c => c.name.includes('log') || c.name.includes('mod'));
      if (logChannel) {
        await logChannel.send(`🔨 ${interaction.user.tag} a banni ${member.user.tag} (${member.id}). Raison: ${reason}`);
      }
    } catch (error) {
      await interaction.reply({ content: '❌ Erreur lors du bannissement.', ephemeral: true });
    }
  }
};
