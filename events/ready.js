import logger from '../services/logger.js';
import { REST, Routes } from 'discord.js';
import fs from 'fs';
import path from 'path';
import 'dotenv/config';
import config from '../config/config.js';

export default async (client) => {
  logger.info(`🤖 Connecté en tant que ${client.user.tag}`);
};
