require('dotenv').config();

const { Client, GatewayIntentBits, Collection, REST, Routes } = require('discord.js');
const { Player } = require('discord-player');
const { DefaultExtractors, YouTubeExtractor } = require('@discord-player/extractor');
const fs = require('fs/promises');
const path = require('path');

// Configuration du client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
  ],
});

// Initialisation des collections
client.commands = new Collection();
// Patch critique pour contourner les erreurs de signature YouTube
const ytdl = require('ytdl-core');
const originalGet = ytdl.getInfo;

ytdl.getInfo = async (url, options) => {
  try {
    return await originalGet(url, {
      ...options,
      requestOptions: {
        headers: {
          // User-Agent critique pour imiter un navigateur réel
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36 Edg/125.0.0.0',
          // Cookies ABSOLUMENT nécessaires (voir étape 3)
          cookie: process.env.YT_COOKIE || '' 
        }
      },
      lang: 'fr' // Force le français pour éviter les blocages régionaux
    });
  } catch (error) {
    console.error('[YTDL CORE ERROR]', error);
    throw new Error('Échec d\'extraction : YouTube a bloqué la requête');
  }
};
// Fonction d'initialisation du player
const initializePlayer = async () => {
  try {
    const player = new Player(client, {
  ytdlOptions: {
    quality: 'highestaudio',
    highWaterMark: 1 << 25,
    requestOptions: {
      headers: {
        // Cookies IMPÉRATIFS pour contourner les restrictions
        cookie: process.env.YT_COOKIE,
        // User-Agent personnalisé
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
      }
    }
  }
});

    client.player = player;

    // Chargement des extracteurs (nouvelle méthode)
    await player.extractors.loadDefault();
    
    // Alternative pour charger uniquement YouTube :
    // await player.extractors.register(YouTubeExtractor, {});

    // Gestion des erreurs
    player.events.on('error', (queue, error) => {
      console.error(`[Player Error] ${error.message}`);
      queue.metadata?.channel?.send(`❌ Erreur: ${error.message}`).catch(console.error);
    });

    console.log('✅ Player initialisé avec succès');
    return player;
  } catch (error) {
    console.error('❌ Erreur d\'initialisation du player:', error);
    throw error;
  }
};

// Chargement des commandes
const loadCommands = async () => {
  try {
    const commandsPath = path.join(__dirname, 'commands');
    const commandFolders = await fs.readdir(commandsPath);

    for (const folder of commandFolders) {
      const folderPath = path.join(commandsPath, folder);
      const commandFiles = (await fs.readdir(folderPath)).filter(file => file.endsWith('.js'));

      for (const file of commandFiles) {
        const command = require(path.join(folderPath, file));
        
        if (!command.data?.name || !command.execute) {
          console.warn(`⚠️ Commande invalide: ${file}`);
          continue;
        }
        
        client.commands.set(command.data.name, command);
      }
    }
    console.log(`✅ ${client.commands.size} commande(s) chargée(s)`);
  } catch (error) {
    console.error('❌ Erreur de chargement des commandes:', error);
    throw error;
  }
};

// Déploiement des commandes
const deployCommands = async () => {
  try {
    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
    const commands = client.commands.map(cmd => cmd.data.toJSON());

    console.log('📡 Déploiement des commandes...');
    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: commands }
    );
    console.log('✅ Commandes déployées avec succès');
  } catch (error) {
    console.error('❌ Erreur de déploiement:', error);
    throw error;
  }
};

// Gestion des interactions
client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(`Erreur avec ${command.data.name}:`, error);
    await interaction.reply({ 
      content: '❌ Erreur d\'exécution', 
      ephemeral: true 
    }).catch(console.error);
  }
});

// Événement Ready
client.once('ready', async () => {
  try {
    console.log(`🤖 Connecté comme ${client.user.tag}`);
    await deployCommands();
  } catch (error) {
    console.error('❌ Erreur au démarrage:', error);
  }
});

// Démarrage du bot
(async () => {
  try {
    await initializePlayer();
    await loadCommands();
    await client.login(process.env.DISCORD_TOKEN);
  } catch (error) {
    console.error('💥 Échec critique:', error);
    process.exit(1);
  }
})();

// Gestion des erreurs globales
process.on('unhandledRejection', error => console.error('Unhandled Rejection:', error));
process.on('uncaughtException', error => console.error('Uncaught Exception:', error));