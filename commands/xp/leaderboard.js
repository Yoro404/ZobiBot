const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('../../utils/database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('Affiche le classement des membres les plus actifs')
        .setDMPermission(false)
        .addIntegerOption(option =>
            option.setName('limit')
                .setDescription('Nombre de membres à afficher (1-20)')
                .setMinValue(1)
                .setMaxValue(20)
                .setRequired(false)),
    
    async execute(interaction) {
        await interaction.deferReply();
        
        const limit = interaction.options.getInteger('limit') || 10;
        const guildId = interaction.guild.id;

        try {
            const topUsers = await db.getTopUsers(guildId, limit);

            if (!topUsers || topUsers.length === 0) {
                return interaction.editReply({
                    content: '❌ Aucune donnée XP disponible pour ce serveur',
                    embeds: []
                });
            }

            const embed = new EmbedBuilder()
                .setTitle(`🏆 Classement des ${limit} meilleurs membres`)
                .setColor(0xFFD700)
                .setThumbnail(interaction.guild.iconURL())
                .setDescription(`Classement d'XP du serveur ${interaction.guild.name}`)
                .setFooter({ 
                    text: `Mis à jour`, 
                    iconURL: interaction.client.user.displayAvatarURL() 
                })
                .setTimestamp();

            // Ajout des utilisateurs avec formatage amélioré
            topUsers.forEach((user, index) => {
                const medal = index < 3 ? ['🥇', '🥈', '🥉'][index] : `#${index + 1}`;
                embed.addFields({
                    name: `${medal} ${user.username}`,
                    value: `└ Niveau ${user.level} • ${user.totalXp} XP`,
                    inline: false
                });
            });

            // Ajout de l'utilisateur actuel s'il n'est pas dans le top
            const userId = interaction.user.id;
            if (!topUsers.some(u => u.userId === userId)) {
                const userData = await db.getUser(userId, guildId);
                if (userData) {
                    embed.addFields({
                        name: '\u200b',
                        value: `\n**Votre position**\n${userData.rank ? `#${userData.rank}` : 'Non classé'} • Niveau ${userData.level} • ${userData.totalXp} XP`,
                        inline: false
                    });
                }
            }

            await interaction.editReply({ embeds: [embed] });

        } catch (error) {
            console.error('[Leaderboard Error]', error);
            await interaction.editReply({
                content: '❌ Une erreur est survenue lors de la génération du classement',
                embeds: []
            });
        }
    }
};