import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Expulse un membre du serveur')
    .addUserOption(option =>
      option.setName('membre').setDescription('Membre à expulser').setRequired(true))
    .addStringOption(option =>
      option.setName('raison').setDescription('Raison de l\'expulsion').setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
    .setDMPermission(false),

  async execute(interaction) {
    const member = interaction.options.getMember('membre');
    const reason = interaction.options.getString('raison') || 'Aucune raison spécifiée';
    if (!member)
      return interaction.reply({ content: '❌ Membre introuvable.', ephemeral: true });
    if (!member.kickable)
      return interaction.reply({ content: '❌ Impossible d\'expulser ce membre.', ephemeral: true });
    if (member.id === interaction.user.id)
      return interaction.reply({ content: '❌ Vous ne pouvez pas vous expulser vous-même!', ephemeral: true });
    try {
      await member.kick(reason);
      await interaction.reply({ content: `👢 ${member.user.tag} a été expulsé. Raison: ${reason}` });
      const logChannel = interaction.guild.channels.cache.find(
        c => c.name.includes('log') || c.name.includes('mod'));
      if (logChannel) {
        await logChannel.send({
          embeds: [{
            color: 0xFFA500,
            title: '📝 Expulsion',
            fields: [
              { name: 'Membre', value: `${member.user.tag} (${member.id})`, inline: true },
              { name: 'Modérateur', value: interaction.user.tag, inline: true },
              { name: 'Raison', value: reason }
            ],
            timestamp: new Date()
          }]
        });
      }
    } catch (error) {
      await interaction.reply({ content: '❌ Erreur lors de l\'expulsion.', ephemeral: true });
    }
  }
};
