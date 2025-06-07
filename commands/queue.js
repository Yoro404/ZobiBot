import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { useMainPlayer } from 'discord-player';

export default {
  data: new SlashCommandBuilder()
    .setName('queue')
    .setDescription('Affiche la file d\'attente de musiques'),

  async execute(interaction) {
    const player = useMainPlayer();
    const guildId = interaction.guild.id;
    const queue = player.nodes.get(guildId);
    if (!queue || !queue.node.isPlaying() || !queue.tracks || queue.tracks.size === 0) {
      return interaction.reply({ content: '❌ La file d\'attente est vide.', ephemeral: true });
    }
    const tracks = Array.from(queue.tracks.values());
    const current = queue.currentTrack;
    let desc = '';
    tracks.slice(0, 10).forEach((track, i) => {
      desc += `\n**${i+1}.** [${track.title}](${track.url}) • \`${track.duration}\` • par ${track.author}`;
    });
    const embed = new EmbedBuilder()
      .setColor('#00C7FF')
      .setTitle('📜 File d\'attente')
      .setDescription(`**En cours :** [${current.title}](${current.url})\n\n${desc}${tracks.length > 10 ? `\n...et ${tracks.length - 10} autres` : ''}`)
      .setFooter({ text: `Total : ${tracks.length} dans la file`, iconURL: interaction.guild.iconURL() })
      .setTimestamp();
    await interaction.reply({ embeds: [embed], ephemeral: false });
  }
};
