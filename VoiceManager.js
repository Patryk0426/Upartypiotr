const {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  getVoiceConnection,
  AudioPlayerStatus
} = require('@discordjs/voice');

class VoiceManager {
  play(message, filePath) {
    const channel = message.member.voice.channel;
    if (!channel) return message.reply('Musisz być na VC.');

    const conn = joinVoiceChannel({
      channelId: channel.id,
      guildId: channel.guild.id,
      adapterCreator: channel.guild.voiceAdapterCreator
    });

    const player = createAudioPlayer();
    const resource = createAudioResource(filePath);
    player.play(resource);
    conn.subscribe(player);

    player.on(AudioPlayerStatus.Idle, () => {
      conn.destroy();
    });
  }

  playToChannel(client, vcId, filePath) {
    const channel = client.channels.cache.get(vcId);
    if (!channel || channel.type !== 2) return console.log('Niepoprawny VC ID.');

    const conn = joinVoiceChannel({
      channelId: vcId,
      guildId: channel.guild.id,
      adapterCreator: channel.guild.voiceAdapterCreator
    });

    const player = createAudioPlayer();
    const resource = createAudioResource(filePath);
    player.play(resource);
    conn.subscribe(player);

    player.on(AudioPlayerStatus.Idle, () => conn.destroy());
  }
}

module.exports = VoiceManager;