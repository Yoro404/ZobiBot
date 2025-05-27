const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kick')
        .setDescription('Expulse un membre du serveur')
        .addUserOption(option =>
            option.setName('membre')
                .setDescription('Membre à expulser')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('raison')
                .setDescription('Raison de l\'expulsion')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
        .setDMPermission(false),
    
    async execute(interaction) {
        const member = interaction.options.getMember('membre');
        const reason = interaction.options.getString('raison') || 'Aucune raison spécifiée';

        // Vérifications
        if (!member) {
            return interaction.reply({ 
                content: '❌ Membre introuvable sur ce serveur.', 
                ephemeral: true 
            });
        }

        if (!member.kickable) {
            return interaction.reply({ 
                content: '❌ Je ne peux pas expulser ce membre (rôle trop élevé ou permissions manquantes).', 
                ephemeral: true 
            });
        }

        if (member.id === interaction.user.id) {
            return interaction.reply({ 
                content: '❌ Vous ne pouvez pas vous expulser vous-même!', 
                ephemeral: true 
            });
        }

        // Exécution
        try {
            await member.kick(reason);
            
            // Réponse publique
            await interaction.reply({
                content: `👢 ${member.user.tag} a été expulsé. Raison: ${reason}`,
                allowedMentions: { users: [] }
            });

            // Logs modération
            const logChannel = interaction.guild.channels.cache.find(
                c => c.name === 'logs-moderation' || c.name === 'mod-logs'
            );
            
            if (logChannel) {
                await logChannel.send({
                    embeds: [{
                        color: 0xFFA500,
                        title: '📝 Expulsion',
                        fields: [
                            { name: 'Membre', value: `${member.user.tag} (${member.id})`, inline: true },
                            { name: 'Modérateur', value: interaction.user.tag, inline: true },
                            { name: 'Raison', value: reason }
                        ],
                        timestamp: new Date()
                    }]
                });
            }

        } catch (error) {
            console.error(`Erreur lors de l'expulsion: ${error}`);
            await interaction.reply({
                content: '❌ Une erreur est survenue lors de l\'expulsion.',
                ephemeral: true
            });
        }
    }
};