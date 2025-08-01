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

    console.log("🖥️ Terminal administratora bota uruchomiony. Wpisz 'help' po listę komend.");

    rl.on('line', async (input) => {
      const [cmd, ...args] = input.trim().split(' ');

      switch (cmd) {
        case 'play': {
          const [vcId, fileName] = args;
          if (!vcId || !fileName) return console.log("Użycie: play <VC_ID> <plik.mp3>");
          const filePath = path.join(__dirname, 'sounds', fileName);
          this.voiceManager.playToChannel(this.client, vcId, filePath);
          break;
        }

        case 'kick': {
          const [userId] = args;
          const member = await this.findMemberById(userId);
          if (member?.voice?.channel) {
            await member.voice.disconnect();
            console.log(`✅ Wyrzucono ${member.user.tag} z VC.`);
          } else {
            console.log(`❌ Użytkownik nie jest na VC.`);
          }
          break;
        }

        case 'server': {
          const [subcmd, userId] = args;
          if (subcmd === 'kick') {
            if (!userId) {
              console.log("Użycie: server kick <USER_ID>");
              break;
            }
            const member = await this.findMemberById(userId);
            if (member) {
              try {
                await member.kick();
                console.log(`✅ Użytkownik ${member.user.tag} został zabrany przez CIA.`);
                // Wysyłanie wiadomości na kanał o ID 715904416556777558
                const channel = this.client.channels.cache.get('715904416556777558');
                if (channel) {
                  channel.send(`Użytkownik ${member.user.tag} został zabrany przez CIA.`);
                } else {
                  console.log("❌ Nie znaleziono kanału o ID 715904416556777558.");
                }
              } catch (err) {
                console.log(`❌ Nie udało się wyrzucić użytkownika: ${err.message}`);
              }
            } else {
              console.log("❌ Nie znaleziono użytkownika na żadnym serwerze.");
            }
          } else {
            console.log('❌ Nieznana subkomenda dla "server". Dostępne: kick');
          }
          break;
        }

        case 'mute': {
          const [userId] = args;
          const member = await this.findMemberById(userId);
          if (member?.voice?.channel) {
            await member.voice.setMute(true);
            console.log(`🔇 Wyciszono ${member.user.tag}.`);
          } else {
            console.log(`❌ Nie znaleziono użytkownika na VC.`);
          }
          break;
        }

        case 'unmute': {
          const [userId] = args;
          const member = await this.findMemberById(userId);
          if (member?.voice?.channel) {
            await member.voice.setMute(false);
            console.log(`🔊 Odmutowano ${member.user.tag}.`);
          } else {
            console.log(`❌ Nie znaleziono użytkownika na VC.`);
          }
          break;
        }

        case 'deaf': {
          const [userId] = args;
          const member = await this.findMemberById(userId);
          if (member?.voice?.channel) {
            await member.voice.setDeaf(true);
            console.log(`📵 Ogłuszono ${member.user.tag}.`);
          } else {
            console.log(`❌ Nie znaleziono użytkownika na VC.`);
          }
          break;
        }

        case 'undeaf': {
          const [userId] = args;
          const member = await this.findMemberById(userId);
          if (member?.voice?.channel) {
            await member.voice.setDeaf(false);
            console.log(`🔔 Odogłuszono ${member.user.tag}.`);
          } else {
            console.log(`❌ Nie znaleziono użytkownika na VC.`);
          }
          break;
        }
        case 'exit': {
          console.log("❌ Zamykanie terminala...");
          process.exit(0);
        }

        default:
          console.log('❌ Nieznana komenda. Wpisz "help".');
      }
    });
  }

  async findMemberById(userId) {
    for (const [guildId, guild] of this.client.guilds.cache) {
      const member = await guild.members.fetch(userId).catch(() => null);
      if (member) return member;
    }
    return null;
  }
}

module.exports = TerminalInterface;
