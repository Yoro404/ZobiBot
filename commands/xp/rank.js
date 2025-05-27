const { Rank } = require('canvacord');
const { SlashCommandBuilder, AttachmentBuilder, EmbedBuilder } = require('discord.js');
const calculateLevelXp = require('../../utils/xp/calculateLevelXp');
const db = require('../../utils/database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rank')
        .setDescription('Affiche votre niveau et progression')
        .addUserOption(option =>
            option.setName('utilisateur')
                .setDescription('Membre à vérifier (optionnel)')
                .setRequired(false))
        .setDMPermission(false),

    async execute(interaction) {
        await interaction.deferReply();
        
        const targetUser = interaction.options.getUser('utilisateur') || interaction.user;
        const guildId = interaction.guild.id;
        const userId = targetUser.id;

        try {
            // Récupération des données
            const userData = await db.getUser(userId, guildId);
            if (!userData) {
                return interaction.editReply({
                    content: '❌ Données introuvables pour cet utilisateur',
                    embeds: []
                });
            }

            // Calcul du rang si non fourni
            if (typeof userData.rank === 'undefined') {
                const topUsers = await db.getTopUsers(guildId, 1000);
                userData.rank = topUsers.findIndex(u => u.userId === userId) + 1;
            }

            // Création de la carte de rang
            const rankCard = new Rank()
                .setAvatar(targetUser.displayAvatarURL({ 
                    size: 256,
                    extension: 'png',
                    forceStatic: true 
                }))
                .setCurrentXP(userData.xp || 0)
                .setRequiredXP(calculateLevelXp(userData.level + 1))
                .setLevel(userData.level || 1)
                .setRank(userData.rank || 0)
                .setUsername(targetUser.username)
                .setBackground('COLOR', '#2b2d31')
                .setProgressBar('#FFD700', 'COLOR')
                .setOverlay('#000000', 0.3);

            const cardBuffer = await rankCard.build()
                .catch(err => {
                    console.error('[Rank Card Error]', err);
                    throw new Error('Échec de génération de la carte');
                });

            // Création de l'embed
            const embed = new EmbedBuilder()
                .setColor('#FFD700')
                .setTitle(`Niveau ${userData.level} • Rang #${userData.rank}`)
                .setDescription(`**${targetUser.username}**`)
                .setImage('attachment://rank.png')
                .setFooter({ 
                    text: `XP: ${userData.xp}/${calculateLevelXp(userData.level + 1)}`, 
                    iconURL: interaction.guild.iconURL() 
                });

            const attachment = new AttachmentBuilder(cardBuffer, { name: 'rank.png' });

            await interaction.editReply({ 
                embeds: [embed],
                files: [attachment] 
            });

        } catch (error) {
            console.error('[Rank Command Error]', error);
            await interaction.editReply({
                content: `❌ Erreur: ${error.message}`,
                embeds: []
            });
        }
    }
};