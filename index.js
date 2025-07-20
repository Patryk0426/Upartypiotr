require('dotenv').config();
const BotClient = require('./BotClient');
const bot = new BotClient(process.env.DISCORD_TOKEN);
bot.start();
