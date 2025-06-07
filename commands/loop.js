import { SlashCommandBuilder } from 'discord.js';
import { useMainPlayer } from 'discord-player';

export default {
  data: new SlashCommandBuilder()
    .setName('loop')
    .setDescription('Active ou désactive la boucle sur la musique ou la playlist')
    .addStringOption(option =>
      option.setName('mode')
        .setDescription('Type de boucle')
        .setRequired(true)
        .addChoices(
          { name: 'Off', value: 'off' },
          { name: 'Musique', value: 'track' },
          { name: 'Playlist', value: 'queue' }
        )
    ),

  async execute(interaction) {
    const player = useMainPlayer();
    const guildId = interaction.guild.id;
    const queue = player.nodes.get(guildId);
    if (!queue || !queue.node.isPlaying()) {
      return interaction.reply({ content: '❌ Aucune musique en cours.', ephemeral: true });
    }
    const mode = interaction.options.getString('mode');
    let status = '';
    switch (mode) {
      case 'off':
        queue.node.setRepeatMode(0);
        status = '❎ Boucle désactivée.';
        break;
      case 'track':
        queue.node.setRepeatMode(1);
        status = '🔂 Boucle sur la musique activée !';
        break;
      case 'queue':
        queue.node.setRepeatMode(2);
        status = '🔁 Boucle sur la playlist activée !';
        break;
      default:
        status = '❌ Mode de boucle inconnu.';
        break;
    }
    await interaction.reply({ content: status, ephemeral: false });
  }
};
