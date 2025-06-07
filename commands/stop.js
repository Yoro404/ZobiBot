import { SlashCommandBuilder } from 'discord.js';
import { useMainPlayer } from 'discord-player';

export default {
  data: new SlashCommandBuilder()
    .setName('stop')
    .setDescription('Arrête la musique et vide la file d\'attente'),

  async execute(interaction) {
    const player = useMainPlayer();
    const guildId = interaction.guild.id;
    const queue = player.nodes.get(guildId);
    if (!queue || !queue.node.isPlaying()) {
      return interaction.reply({ content: '❌ Aucune musique en cours sur ce serveur.', ephemeral: true });
    }
    try {
      await queue.clear(); 
      queue.node.stop();   
      queue.delete();      
      await interaction.reply({ content: '⏹️ Musique stoppée et file d\'attente vidée !', ephemeral: false });
    } catch (e) {
      await interaction.reply({ content: '❌ Impossible d\'arrêter la musique.', ephemeral: true });
    }
  }
};
