import { REST, Routes } from 'discord.js';
import fs from 'fs';
import path from 'path';
import config from './config/config.js';
import 'dotenv/config';

const commands = [];
const commandsPath = path.join(process.cwd(), 'src/commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
  const command = (await import(`./commands/${file}`)).default;
  if (command && command.data) {
    commands.push(command.data.toJSON());
  }
}

const rest = new REST({ version: '10' }).setToken(config.token);

(async () => {
  try {
    console.log('Purge des commandes existantes...');
    await rest.put(
      Routes.applicationGuildCommands(config.clientId, config.guildId),
      { body: [] },
    );
    console.log('Purge effectuée. Déploiement des nouvelles commandes...');
    await rest.put(
      Routes.applicationGuildCommands(config.clientId, config.guildId),
      { body: commands },
    );
    console.log('✔️ Déploiement terminé !');
  } catch (error) {
    console.error(error);
  }
})();
