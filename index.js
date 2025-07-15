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
  if (newState.selfMute || newState.selfDeaf || newState.serverDeaf || newState.serverMute) {
    try {
      if (member.voice.channel) {
        if (member.user.id !== client.user.id) { // NIE WYRZUCAJ BOTA
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

const voteKickMap = new Map(); // mapa aktywnych głosowań

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  // Obsługa #votekick
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

    const voters = new Set(); // zbiór unikalnych głosujących

    voteKickMap.set(mentioned.id, true); // zablokuj powtórne głosowanie

    const collector = voteMessage.createReactionCollector({
      filter: (reaction, user) => reaction.emoji.name === "👍" && !user.bot,
      time: 60000, // 1 minuta
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

          // Nakładamy timeout głosowy na minutę
          await applyVoiceTimeout(mentioned, 60000);
        } catch (err) {
          console.error("Błąd przy wyrzucaniu lub timeoutowaniu:", err);
          await message.channel.send("❌ Nie udało się wyrzucić lub wyciszyć użytkownika.");
        }
      } else {
        message.channel.send(`⏹️ Głosowanie na ${mentioned} zakończone. Za mało głosów.`);
      }
    });
  }

  // Obsługa #szpont
  if (message.content === "#szpont") {
    const voiceChannel = message.member.voice.channel;

    if (!voiceChannel) {
      return message.reply("🎧 Musisz być na kanale głosowym.");
    }

    // Losuj plik mp3 z folderu sounds
    const sounds = Array.from({length: 10}, (_, i) => `${i+1}.mp3`);
    const randomSound = sounds[Math.floor(Math.random() * sounds.length)];
    const soundPath = path.join(__dirname, "sounds", randomSound);

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

  // Obsługa #brygada
  if (message.content === "#brygada") {
    const voiceChannel = message.member.voice.channel;

    if (!voiceChannel) {
      return message.reply("🎧 Musisz być na kanale głosowym.");
    }

    const soundPath = path.join(__dirname, "sounds", "brygada.mp3");

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

  if (message.content === "#gosia") {
    const voiceChannel = message.member.voice.channel;

    if (!voiceChannel) {
      return message.reply("🎧 Musisz być na kanale głosowym.");
    }

    const soundPath = path.join(__dirname, "sounds", "gosia.mp3");

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
  if (message.content === "#princepolo") {
    const voiceChannel = message.member.voice.channel;

    if (!voiceChannel) {
      return message.reply("🎧 Musisz być na kanale głosowym.");
    }

    const soundPath = path.join(__dirname, "sounds", "pricepolo.mp3");

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
  const CHANNEL_ID = "715904416556777558";
  setInterval(async () => {
  const guilds = client.guilds.cache;

  guilds.forEach(async (guild) => {
    const members = await guild.members.fetch();

    members.forEach(async (member) => {
      if (
        member.voice.channel && // user jest na VC
        !member.user.bot // nie bot
      ) {
        const chance = Math.floor(Math.random() * 1000); // 0 - 999
        if (chance === 0) {
          try {
            await member.voice.disconnect("Losowy wyrzut z szansą 1/1000");
            const channel = client.channels.cache.get(CHANNEL_ID);
            await channel.send(`💣 Rozjebano ${member.user.tag}`);
            console.log(`💣 Rozjebano ${member.user.tag}`);
          } catch (err) {
            console.error(`❌ Błąd przy wyrzucaniu ${member.user.tag}:`, err.message);
          }
        }
      }
    });
  });
}, 1000); 

});

;





