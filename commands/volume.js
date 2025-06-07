import { SlashCommandBuilder } from 'discord.js';
import { useMainPlayer } from 'discord-player';

export default {
  data: new SlashCommandBuilder()
    .setName('volume')
    .setDescription('Modifie le volume du bot de musique (0-150%)')
    .addIntegerOption(option =>
      option.setName('pourcentage')
        .setDescription('Nouveau volume (0 à 150)')
        .setMinValue(0)
        .setMaxValue(150)
        .setRequired(true)
    ),

  async execute(interaction) {
    const player = useMainPlayer();
    const guildId = interaction.guild.id;
    const queue = player.nodes.get(guildId);
    const volume = interaction.options.getInteger('pourcentage');
    if (!queue || !queue.node.isPlaying()) {
      return interaction.reply({ content: '❌ Aucune musique en cours sur ce serveur.', ephemeral: true });
    }
    try {
      queue.node.setVolume(volume);
      await interaction.reply({ content: `🔊 Volume réglé à **${volume}%** !`, ephemeral: false });
    } catch (e) {
      await interaction.reply({ content: `❌ Impossible de changer le volume.`, ephemeral: true });
    }
  }
};
