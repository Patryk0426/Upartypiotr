class VoteKickManager {
  constructor() {
    this.activeVotes = new Map();
  }

  async startVoteKick(message) {
    const mentioned = message.mentions.members.first();
    if (!mentioned) return message.reply('❌ Oznacz osobę.');

    if (!mentioned.voice.channel) return message.reply('❌ Użytkownik nie jest na kanale głosowym.');

    if (!message.guild.members.me.permissions.has('MoveMembers')) {
      return message.reply('❌ Bot nie ma uprawnień MOVE_MEMBERS!');
    }

    if (this.activeVotes.has(mentioned.id)) return message.reply('⏳ Głosowanie już trwa.');

    this.activeVotes.set(mentioned.id, true);

    const voteMsg = await message.channel.send(`Głosowanie na wyjebanie ${mentioned} z kanału głosowego! 4 reakcje i wypierdalm tego cwela !!!!!!`);

    await voteMsg.react('👍');

    const voters = new Set();

    const collector = voteMsg.createReactionCollector({
      filter: (reaction, user) => reaction.emoji.name === '👍' && !user.bot,
      time: 60000,
    });

    collector.on('collect', (reaction, user) => {
      voters.add(user.id);
      console.log(`Głos od: ${user.tag} (${voters.size}/3)`);
      if (voters.size >= 3) collector.stop('kick');
    });

    collector.on('end', async (_, reason) => {
      this.activeVotes.delete(mentioned.id);
      if (reason === 'kick') {
        if (!mentioned.voice.channel) {
          return 
        }
        try {
          await mentioned.voice.disconnect();
          message.channel.send(`✅ ${mentioned.user.tag} został rozjebany🤓💣`);
        } catch (error) {
          console.error('Błąd podczas wyrzucania:', error);
          message.channel.send('❌ Nie udało się wyrzucić użytkownika.');
        }
      } else {
        message.channel.send('Za mało głosów, nie wyrzucamy.');
      }
    });
  }
}

module.exports = VoteKickManager;




