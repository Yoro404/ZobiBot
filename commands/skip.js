import { SlashCommandBuilder } from 'discord.js';
import { useMainPlayer } from 'discord-player';

export default {
  data: new SlashCommandBuilder()
    .setName('skip')
    .setDescription('Passe à la musique suivante dans la file d\'attente'),

  async execute(interaction) {
    const player = useMainPlayer();
    const guildId = interaction.guild.id;
    const queue = player.nodes.get(guildId);
    if (!queue || !queue.node.isPlaying()) {
      return interaction.reply({ content: '❌ Aucune musique en cours à passer.', ephemeral: true });
    }
    try {
      await queue.node.skip();
      await interaction.reply({ content: '⏭️ Musique suivante !', ephemeral: false });
    } catch (e) {
      await interaction.reply({ content: '❌ Impossible de passer la musique.', ephemeral: true });
    }
  }
};
