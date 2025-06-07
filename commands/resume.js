import { SlashCommandBuilder } from 'discord.js';
import { useMainPlayer } from 'discord-player';

export default {
  data: new SlashCommandBuilder()
    .setName('resume')
    .setDescription('Relance la musique en pause'),

  async execute(interaction) {
    const player = useMainPlayer();
    const guildId = interaction.guild.id;
    const queue = player.nodes.get(guildId);
    if (!queue || !queue.node.isPlaying()) {
      return interaction.reply({ content: '❌ Aucune musique n\'est lancée.', ephemeral: true });
    }
    if (!queue.node.isPaused()) {
      return interaction.reply({ content: '▶️ La musique est déjà en lecture.', ephemeral: true });
    }
    try {
      queue.node.setPaused(false);
      await interaction.reply({ content: '▶️ Musique relancée !', ephemeral: false });
    } catch (e) {
      await interaction.reply({ content: '❌ Impossible de relancer la musique.', ephemeral: true });
    }
  }
};
