const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Affiche la latence du bot et de l\'API Discord'),
    
    async execute(interaction) {
        // Envoi initial et mesure du temps
        const sent = await interaction.reply({ 
            content: '🏓 Pong! Calcul en cours...', 
            fetchReply: true,
            ephemeral: true 
        });

        // Calcul des latences
        const roundtripLatency = sent.createdTimestamp - interaction.createdTimestamp;
        const apiLatency = Math.round(interaction.client.ws.ping);
        const uptime = process.uptime();

        // Formatage du temps de fonctionnement
        const formatUptime = (seconds) => {
            const days = Math.floor(seconds / (3600 * 24));
            seconds %= 3600 * 24;
            const hours = Math.floor(seconds / 3600);
            seconds %= 3600;
            const minutes = Math.floor(seconds / 60);
            seconds = Math.floor(seconds % 60);
            
            return `${days}d ${hours}h ${minutes}m ${seconds}s`;
        };

        // Création de l'embed
        const embed = {
            color: 0x3498db,
            title: '📊 Statistiques du Bot',
            fields: [
                {
                    name: 'Latence Client',
                    value: `\`${roundtripLatency}ms\``,
                    inline: true
                },
                {
                    name: 'Latence API',
                    value: `\`${apiLatency}ms\``,
                    inline: true
                },
                {
                    name: 'Temps de fonctionnement',
                    value: `\`${formatUptime(uptime)}\``,
                    inline: true
                }
            ],
            timestamp: new Date(),
            footer: {
                text: `Demandé par ${interaction.user.username}`,
                icon_url: interaction.user.displayAvatarURL()
            }
        };

        // Mise à jour de la réponse
        await interaction.editReply({ 
            content: '',
            embeds: [embed] 
        });
    }
};