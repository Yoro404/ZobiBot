import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { useMainPlayer, QueryType } from 'discord-player';

export default {
  data: new SlashCommandBuilder()
    .setName('play')
    .setDescription('Joue une musique depuis YouTube, Spotify ou par recherche')
    .addStringOption(option =>
      option.setName('musique')
        .setDescription('Nom, URL, ou termes de recherche')
        .setRequired(true)
    ),

  async execute(interaction) {
    const player = useMainPlayer();
    const channel = interaction.member.voice.channel;
    const rawOptions = interaction.options?._hoistedOptions || [];
    let query = '';
    if (rawOptions.length > 0 && typeof rawOptions[0].value === 'string') {
      query = rawOptions[0].value;
    } else if (interaction.options.getString) {
      query = interaction.options.getString('musique');
    } else {
      query = '';
    }
    if (!query || typeof query !== 'string' || query.trim().length < 2) {
      return interaction.reply({ content: '❌ La requête de musique est invalide.', ephemeral: true });
    }
    if (!channel) {
      return interaction.reply({ content: '❌ Vous devez être dans un vocal !', ephemeral: true });
    }
    const permissions = channel.permissionsFor(interaction.client.user);
    if (!permissions.has(['Connect', 'Speak'])) {
      return interaction.reply({ content: '❌ Je n\'ai pas les permissions pour ce vocal.', ephemeral: true });
    }
    await interaction.deferReply();
    try {
      const searchResult = await player.search(query.trim(), {
        requestedBy: interaction.user,
        searchEngine: QueryType.AUTO,
      });
      if (!searchResult || !searchResult.hasTracks()) {
        return interaction.editReply({ content: '❌ Aucun résultat.' });
      }
      let queue = player.nodes.get(interaction.guild.id);
      if (!queue) {
        queue = player.nodes.create(interaction.guild, {
          metadata: { channel: interaction.channel, requestedBy: interaction.user },
          volume: 80,
          leaveOnEmpty: true,
          leaveOnEmptyCooldown: 300000,
          leaveOnEnd: true,
          leaveOnEndCooldown: 300000,
        });
      }
      if (!queue.connection) await queue.connect(channel);
      const track = searchResult.tracks[0];
      queue.addTrack(track);
      if (!queue.node.isPlaying()) await queue.node.play();
      const embed = new EmbedBuilder()
        .setColor('#00FF00')
        .setTitle('🎵 Musique ajoutée à la queue')
        .setDescription(`**[${track.title}](${track.url})**`)
        .addFields(
          { name: '👤 Artiste', value: track.author, inline: true },
          { name: '⏱️ Durée', value: track.duration, inline: true },
          { name: '📍 Position', value: `${queue.tracks.size + 1}`, inline: true }
        )
        .setThumbnail(track.thumbnail)
        .setFooter({ text: `Demandé par ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL() })
        .setTimestamp();
      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error('[Play Command Error]', error);
      let errorMessage = '❌ Erreur lors de la lecture.';
      if (error.message && error.message.includes('Sign in to confirm')) {
        errorMessage = '❌ Vidéo YouTube nécessitant authentification.';
      } else if (error.message && error.message.includes('Private video')) {
        errorMessage = '❌ Vidéo privée.';
      } else if (error.message && error.message.includes('Age restricted')) {
        errorMessage = '❌ Vidéo avec restriction d\'âge.';
      }
      await interaction.editReply({ content: errorMessage });
    }
  }
};
