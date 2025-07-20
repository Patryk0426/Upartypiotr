const { Client, GatewayIntentBits } = require('discord.js');
const CommandHandler = require('./CommandHandler');
const TerminalInterface = require('./TerminalInterface');

class BotClient {
  constructor(token) {
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildVoiceStates,
         GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
      ]
      
    });
    this.token = token;
    this.commandHandler = new CommandHandler(this.client);
    this.terminal = new TerminalInterface(this.client);
  }

  start() {
    this.client.once('ready', () => {
      console.log(`Zalogowano jako ${this.client.user.tag}`);
    });

    this.client.on('messageCreate', (msg) => this.commandHandler.handle(msg));

    this.terminal.startListening();
    this.client.login(this.token);
  }
}
module.exports = BotClient;