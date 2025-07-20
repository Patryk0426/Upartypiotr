const readline = require('readline');
const path = require('path');
const VoiceManager = require('./VoiceManager');

class TerminalInterface {
  constructor(client) {
    this.client = client;
    this.voiceManager = new VoiceManager();
  }

  startListening() {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    rl.on('line', (input) => {
      const [cmd, ...args] = input.split(' ');

      if (cmd === 'play') {
        const [vcId, fileName] = args;
        const filePath = path.join(__dirname, 'sounds', fileName);
        this.voiceManager.playToChannel(this.client, vcId, filePath);

      } else if (cmd === 'ping') {
        console.log('Pong!');

      } else if (cmd === 'exit') {
        console.log('wyłaczam');
        process.exit(0);
        

      } else {
        console.log('Nieznana komenda.');
      }
    });
  }
}

module.exports = TerminalInterface;
