const keepAlive = require("./keepalive");
keepAlive();

const { Client, GatewayIntentBits } = require("discord.js");
const { WebcastPushConnection } = require("tiktok-live-connector");

require('dotenv').config();
const DISCORD_TOKEN = process.env.DISCORD_TOKEN;


const CHANNEL_ID = "1387556067449372672";
const TIKTOK_USERNAME = "uparty_piotr";

const client = new Client({
  intents: [ GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates ],
});

let alreadyAnnounced = false;
let tiktok;

client.once("ready", async () => {
  console.log(`Zalogowano jako ${client.user.tag}`);

  const channel = await client.channels.fetch(CHANNEL_ID);
  startTikTokConnection();

  async function startTikTokConnection() {
    tiktok = new WebcastPushConnection(TIKTOK_USERNAME);

    try {
      await tiktok.connect();
      console.log("🔌 Połączono z TikTokiem");

      tiktok.once("roomUser", (data) => {
        console.log("roomUser data:", data);
        if (data.viewerCount > 0 && !alreadyAnnounced) {
          const channel = client.channels.cache.get(CHANNEL_ID);
          if (channel) {
            channel.send(`<@&1387749656146219139> Dziś Napierdalanie\n  https://tiktok.com/@${TIKTOK_USERNAME}/live \nhttps://www.youtube.com/@Uparty_Piotr \nhttps://trovo.live/s/Uparty_Piotr?roomType=1 \nhttps://kick.com/blackroseofdeath/about \nhttps://m.twitch.tv/blackroseofdeath/home


`);
            alreadyAnnounced = true;
          } else {
            console.log("Nie znaleziono kanału Discord o podanym ID.");
          }
        } else {
          console.log("Streamer nie jest na żywo lub już powiadomiono.");
        }
      });

      tiktok.on("streamStart", async () => {
        console.log("Stream started!");
        if (!alreadyAnnounced) {
          const channel = await client.channels.fetch(CHANNEL_ID);
          channel.send(
            ` <@&1387749656146219139> JAZDA Z KURWAMI \nhttps://tiktok.com/@${TIKTOK_USERNAME}/live \n https://www.youtube.com/@Uparty_Piotr \nhttps://trovo.live/s/Uparty_Piotr?roomType=1 \nhttps://kick.com/blackroseofdeath/about \nhttps://m.twitch.tv/blackroseofdeath/home
            `
          );
          alreadyAnnounced = true;
        }
      });

      tiktok.on("streamEnd", () => {
        console.log("Stream ended!");
        alreadyAnnounced = false;
        channel.send(" <@&1387749656146219139> no i chuj xdddddddddddddddd")
      });

      tiktok.on("disconnected", () => {
        console.log("❌ Rozłączono z TikTokiem");
      });

      tiktok.on("error", (err) => {
        console.error("Błąd TikTokLive:", err);
      });
    } catch (error) {
      if (error.name === "UserOfflineError") {
        console.log("Streamer jest offline. Spróbuję ponownie za 1 minutę...");
        alreadyAnnounced = false;
        setTimeout(startTikTokConnection, 60000);
      } else {
        console.error("Inny błąd połączenia TikTok:", error);
        setTimeout(startTikTokConnection, 60000);
      }
    }
  }
});

client.login(DISCORD_TOKEN);

client.on("voiceStateUpdate", async (oldState, newState) => {
  if (!newState.channel) return;

  const member = newState.member;
  if (newState.selfMute || newState.selfDeaf || newState.serverDeaf || newState.serverMute) {
    try {
      console.log(`❌ ${member.user.tag} został wyrzucony z voice za mute/deaf.`);
      await member.voice.disconnect();
      await member.send("Ty kurwo Szpontowska");
    } catch (err) {
      console.error(`Błąd przy rozłączaniu lub wysyłaniu wiadomości do ${member.user.tag}:`, err);
    }
  }
});


const voteKickMap = new Map(); // mapa aktywnych głosowań

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
      `🗳️ Głosowanie nad wyrzuceniem ${mentioned} z kanału głosowego. Potrzeba **3 głosów**.\nReaguj 👍, by zagłosować. Masz 60 sekund!`
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
        } catch (err) {
          console.error("Błąd przy wyrzucaniu:", err);
          await message.channel.send("❌ Nie udało się wyrzucić użytkownika.");
        }
      } else {
        message.channel.send(`⏹️ Głosowanie na ${mentioned} zakończone. Za mało głosów.`);
      }
    });
  }
});




