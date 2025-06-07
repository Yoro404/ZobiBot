import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { useMainPlayer } from 'discord-player';

export default {
  data: new SlashCommandBuilder()
    .setName('nowplaying')
    .setDescription('Affiche la musique en cours de lecture'),

  async execute(interaction) {
    const player = useMainPlayer();
    const guildId = interaction.guild.id;
    const queue = player.nodes.get(guildId);
    const current = queue?.currentTrack;
    if (!queue || !queue.node.isPlaying() || !current) {
      return interaction.reply({ content: '❌ Rien n\'est en cours de lecture.', ephemeral: true });
    }
    const embed = new EmbedBuilder()
      .setColor('#FFD700')
      .setTitle('🎶 En lecture actuellement')
      .setDescription(`**[${current.title}](${current.url})**`)
      .addFields(
        { name: '👤 Artiste', value: current.author, inline: true },
        { name: '⏱️ Durée', value: current.duration, inline: true },
        { name: '🔗 Lien', value: current.url, inline: false }
      )
      .setThumbnail(current.thumbnail)
      .setFooter({ text: `Demandé par ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL() })
      .setTimestamp();
    await interaction.reply({ embeds: [embed], ephemeral: false });
  }
};
