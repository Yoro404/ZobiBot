const { SlashCommandBuilder } = require('discord.js');
const { useMainPlayer, QueryType } = require('discord-player');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('play')
    .setDescription('Joue une musique YouTube (système corrigé)')
    .addStringOption(option =>
      option.setName('lien')
        .setDescription('Lien YouTube COMPLET (ex: https://www.youtube.com/watch?v=...)')
        .setRequired(true)
    ),

  async execute(interaction) {
    const player = useMainPlayer();
    const channel = interaction.member.voice.channel;
    const query = interaction.options.getString('lien');

    if (!channel) {
      return interaction.reply({ content: '❌ Rejoins un salon vocal !', ephemeral: true });
    }

    try {
      await interaction.deferReply();

      // Force le mode "lien direct" avec timeout augmenté
      const searchResult = await player.search(query, {
        requestedBy: interaction.user,
        searchEngine: QueryType.YOUTUBE_VIDEO,
        fallbackSearchEngine: QueryType.YOUTUBE_VIDEO, // Double vérification
        limit: 1,
        timeout: 30000 // 30 secondes pour éviter les timeouts
      });

      if (!searchResult.hasTracks()) {
        return interaction.followUp('❌ ERREUR : Utilise un lien **EXACT** comme `https://www.youtube.com/watch?v=...`');
      }

      const queue = player.nodes.create(interaction.guild, {
        metadata: { channel: interaction.channel },
        leaveOnEmpty: false, // Désactive toutes les options de sortie automatique
        volume: 60,
        bufferingTimeout: 30000
      });

      // Connexion ultra-robuste
      try {
        await queue.connect(channel, { deaf: true });
      } catch (error) {
        console.error('[CONNECTION CRASH]', error);
        player.deleteQueue(interaction.guildId);
        return interaction.followUp('❌ Crash de connexion au vocal');
      }

      queue.addTrack(searchResult.tracks[0]);
      await queue.node.play();

      return interaction.followUp(`✅ **Succès** : [${searchResult.tracks[0].title}](${query})`);

    } catch (error) {
      console.error('[FATAL ERROR]', error);
      return interaction.followUp('❌ ERREUR CATASTROPHIQUE - Contacte le développeur');
    }
  }
};