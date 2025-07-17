const keepAlive = require("./keepalive");
keepAlive();

const path = require("path");
const { Client, GatewayIntentBits } = require("discord.js");
const {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
  getVoiceConnection,
} = require("@discordjs/voice");
const { channel } = require("diagnostics_channel");

require('dotenv').config();
const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const client = new Client({
  intents: [ GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates ],
});

client.login(DISCORD_TOKEN);

client.on("voiceStateUpdate", async (oldState, newState) => {
  if (!newState.channel) return;

  const member = newState.member;
  if (newState.selfMute || newState.selfDeaf) {
    try {
      if (member.voice.channel) {
        if (member.user.id !== client.user.id) {
          console.log(`❌ ${member.user.tag} został wyrzucony z voice za mute/deaf.`);
          await member.voice.disconnect();
        } else {
          console.log("Bot nie jest wyrzucany z voice za mute/deaf.");
        }
      } else {
        console.log(`${member.user.tag} nie jest już na kanale głosowym.`);
      }
    } catch (err) {
      console.error(`Błąd przy rozłączaniu lub wysyłaniu wiadomości do ${member.user.tag}:`, err);
    }
  }
});

const voteKickMap = new Map();

async function playSound(message, fileName) {
  const voiceChannel = message.member.voice.channel;
  if (!voiceChannel) {
    return message.reply("🎧 Musisz być na kanale głosowym.");
  }
  const soundPath = path.join(__dirname, "sounds", fileName);
  const connection = joinVoiceChannel({
    channelId: voiceChannel.id,
    guildId: voiceChannel.guild.id,
    adapterCreator: voiceChannel.guild.voiceAdapterCreator,
  });
  const player = createAudioPlayer();
  const resource = createAudioResource(soundPath);
  player.play(resource);
  connection.subscribe(player);
  player.on(AudioPlayerStatus.Idle, () => {
    const conn = getVoiceConnection(voiceChannel.guild.id);
    if (conn) conn.destroy();
  });
}

const soundCommands = {
  "#brygada": "brygada.mp3",
  "#gosia": "Gosia.mp3",
  "#princepolo": "pricepolo.mp3"
};
const szpontSounds = Array.from({length: 10}, (_, i) => `${i+1}.mp3`);
if (message.content === "#szpont") {
    const randomSound = szpontSounds[Math.floor(Math.random() * szpontSounds.length)];
    return playSound(message, randomSound);
  }


 if (soundCommands[message.content]) {
    return playSound(message, soundCommands[message.content]);
  }

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;


  if (message.content.startsWith("#votekick")) {
    const mentioned = message.mentions.members.first();
    if (!mentioned) {
      return message.reply("❌ Musisz oznaczyć użytkownika, którego chcesz wyrzucić.");
    }

    const voiceChannel = mentioned.voice.channel;
    if (!voiceChannel) {
      return message.reply("❌ Ten użytkownik nie jest na kanale głosowym.");
    }

    if (voteKickMap.has(mentioned.id)) {
      return message.reply("⏳ Głosowanie na tego użytkownika już trwa.");
    }

    const voteMessage = await message.channel.send(
      `Głosowanie nad wyrzuceniem jebanego cwela : ${mentioned} z vc. 4 reakcje i wypierdalam tego cwela`
    );

    await voteMessage.react("👍");

    const voters = new Set();

    voteKickMap.set(mentioned.id, true);

    const collector = voteMessage.createReactionCollector({
      filter: (reaction, user) => reaction.emoji.name === "👍" && !user.bot,
      time: 60000,
    });

    collector.on("collect", (reaction, user) => {
      voters.add(user.id);
      if (voters.size >= 3) {
        collector.stop("enough_votes");
      }
    });

    collector.on("end", async (_, reason) => {
      voteKickMap.delete(mentioned.id);

      if (reason === "enough_votes") {
        try {
          await mentioned.voice.disconnect();
          await message.channel.send(`✅ ${mentioned} został wyrzucony z voice przez głosowanie.`);
          await mentioned.send("🚫 Zostałeś wyrzucony z kanału głosowego przez głosowanie.");

        
    
        } catch (err) {
          console.error("Błąd przy wyrzucaniu lub timeoutowaniu:", err);
          await message.channel.send("❌ Nie udało się wyrzucić lub wyciszyć użytkownika.");
        }
      } else {
        message.channel.send(`⏹️ Głosowanie na ${mentioned} zakończone. Za mało głosów.`);
      }
    });
  }
});


