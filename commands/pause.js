import { SlashCommandBuilder } from 'discord.js';
import { useMainPlayer } from 'discord-player';

export default {
  data: new SlashCommandBuilder()
    .setName('pause')
    .setDescription('Met la musique en pause'),

  async execute(interaction) {
    const player = useMainPlayer();
    const guildId = interaction.guild.id;
    const queue = player.nodes.get(guildId);
    if (!queue || !queue.node.isPlaying()) {
      return interaction.reply({ content: '❌ Aucune musique en cours sur ce serveur.', ephemeral: true });
    }
    if (queue.node.isPaused()) {
      return interaction.reply({ content: '⏸️ La musique est déjà en pause.', ephemeral: true });
    }
    try {
      queue.node.setPaused(true);
      await interaction.reply({ content: '⏸️ Musique mise en pause !', ephemeral: false });
    } catch (e) {
      await interaction.reply({ content: '❌ Impossible de mettre en pause.', ephemeral: true });
    }
  }
};
