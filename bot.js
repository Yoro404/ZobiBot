import 'dotenv/config';
import { Client, GatewayIntentBits, Collection } from 'discord.js';
import { Player } from 'discord-player';
import { YoutubeiExtractor } from 'discord-player-youtubei';
import { DefaultExtractors } from '@discord-player/extractor';
import { readdir } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

import db from './services/database.js';
import logger from './services/logger.js';
import config from './config/config.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMembers
  ]
});

client.commands = new Collection();
client.events = new Collection();

async function initializePlayer() {
  const player = new Player(client, {
    ytdlOptions: {
      quality: 'highestaudio',
      highWaterMark: 1 << 25
    }
  });
  await player.extractors.register(YoutubeiExtractor, {});
  await player.extractors.loadMulti(DefaultExtractors);

  player.events.on('error', (queue, error) => {
    logger.error(`[Player Error] ${error.message}`);
    queue.metadata?.channel?.send(`❌ Erreur de lecture: ${error.message}`).catch(() => {});
  });
  player.events.on('playerError', (queue, error) => {
    logger.error(`[Player PlayerError] ${error.message}`);
    queue.metadata?.channel?.send(`❌ Erreur de lecture: ${error.message}`).catch(() => {});
  });
  client.player = player;
  logger.info('Player initialisé');
}

async function loadCommands() {
  const commandsPath = path.join(__dirname, 'commands');
  const commandFiles = (await readdir(commandsPath, { withFileTypes: true }))
    .filter(dirent => dirent.isFile() && dirent.name.endsWith('.js'))
    .map(dirent => dirent.name);

  for (const file of commandFiles) {
    const command = (await import(`./commands/${file}`)).default;
    if (!command?.data?.name || !command?.execute) {
      logger.warn(`Commande invalide: ${file}`);
      continue;
    }
    client.commands.set(command.data.name, command);
  }
  logger.info(`${client.commands.size} commande(s) chargée(s)`);
}

async function loadEvents() {
  const eventsPath = path.join(__dirname, 'events');
  const eventFiles = (await readdir(eventsPath, { withFileTypes: true }))
    .filter(dirent => dirent.isFile() && dirent.name.endsWith('.js'))
    .map(dirent => dirent.name);

  for (const file of eventFiles) {
    const eventModule = await import(`./events/${file}`);
    const eventName = file.replace('.js', '');
    client.on(eventName, eventModule.default.bind(null, client));
    client.events.set(eventName, eventModule.default);
  }
  logger.info(`${eventFiles.length} événement(s) chargé(s)`);
}

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;
  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction, client);
  } catch (error) {
    logger.error(`Erreur dans la commande ${interaction.commandName}: ${error}`);
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ content: '❌ Erreur lors de l\'exécution de la commande.', ephemeral: true });
    } else {
      await interaction.reply({ content: '❌ Erreur lors de l\'exécution de la commande.', ephemeral: true });
    }
  }
});

(async () => {
  try {
    config.validate();
    await db.connect();
    await initializePlayer();
    await loadCommands();
    await loadEvents();
    await client.login(process.env.DISCORD_TOKEN);
    logger.info('Bot Discord lancé !');
  } catch (error) {
    logger.error('💥 Échec au lancement du bot: ' + error);
    process.exit(1);
  }
})();

process.on('unhandledRejection', error => logger.error(`UnhandledRejection: ${error}`));
process.on('uncaughtException', error => {
  logger.error(`UncaughtException: ${error}`);
  process.exit(1);
});
