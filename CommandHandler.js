const VoiceManager = require('./VoiceManager');
const VoteKickManager = require('./VoteKickManager');
const path = require('path');

class CommandHandler {
  constructor(client) {
    this.client = client;
    this.voiceManager = new VoiceManager();
    this.voteKick = new VoteKickManager();
    this.sounds = {
      "#brygada": "brygada.mp3",
      "#gosia": "Gosia.mp3",
      "#princepolo": "pricepolo.mp3",
      "#goat": "niga.mp3",
      "#telefon":"telefon.mp3"
    };
  }

  handle(message) {
    if (message.author.bot) return;
     const IGNORED_USER_ID = '1166381517996576768';
  const BLOCKED_COMMANDS = ['boks','dusina'];
if (message.author.id === IGNORED_USER_ID && BLOCKED_COMMANDS.includes(message.content)) {
  return message.reply("jebac cie Kris Piorun");
}

    if (message.content === '#szpont') {
      const randomNumber = Math.floor(Math.random() * 10) + 1;
      const file = path.join(__dirname, 'sounds', `${randomNumber}.mp3`);
      this.voiceManager.play(message, file);
      return;
    }

    if (this.sounds[message.content]) {
      const file = path.join(__dirname, 'sounds', this.sounds[message.content]);
      this.voiceManager.play(message, file);
      return;
    }

    if (message.content.startsWith('#votekick')) {
      this.voteKick.startVoteKick(message);
      return;
    }
    if(message.content === `boks` ){
        message.channel.send(`stop`);
        message.channel.send(`Bacznosc kurwa co jest`);
         message.channel.send(`https://tenor.com/view/boks-stop-mrdzinold-bandura-gif-180426521248071837`);
    }
    if (message.content.includes('dusina')) {
  message.channel.send(`https://media.discordapp.net/attachments/1010540959798411334/1015727331907747923/dusina.gif?ex=687d584b&is=687c06cb&hm=77f29c5f281718555d93c7083484bae366257a1166d0a31264924f3e98b7f53f&`);
  };
   if (message.content === '#help') {
  return message.channel.send({
    content: `📜 **Lista komend:**\n
    🎵 **Dźwięki:**
        #brygada
        #gosia
        #princepolo
        #goat
        #szpont — losowy dźwięk Oppenheimera
        #telefon

        🦶 **Głosowanie:**
        #votekick @user — Wyjebanie cwela z vc

    
`
  });
}
  }}

  


module.exports = CommandHandler;
