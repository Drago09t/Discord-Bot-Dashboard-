const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'history',
  description: 'Show your conversation history count',
  usage: '!history',
  execute: async (message, args, { conversationHistory }) => {
    const userId = message.author.id;
    const history = conversationHistory.get(userId) || [];
    const historyCount = history.length;

    const userMessages = history.filter(msg => msg.role === 'user').length;
    const botMessages = history.filter(msg => msg.role === 'model').length;

    const maxHistory = 20;
    const percentage = Math.round((historyCount / maxHistory) * 100);
    const progressBar = '█'.repeat(Math.floor(percentage / 10)) + '░'.repeat(10 - Math.floor(percentage / 10));

    const embed = new EmbedBuilder()
      .setColor('#9b59b6')
      .setTitle('📝 Conversation History')
      .setDescription('```ansi\n\x1b[1;35m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\x1b[0m\n```')
      .addFields(
        {
          name: '📊 Statistics',
          value: `\`\`\`yaml\nTotal Messages: ${historyCount}\nYour Messages: ${userMessages}\nBot Responses: ${botMessages}\n\`\`\``,
          inline: false
        },
        {
          name: '💾 Memory Usage',
          value: `\`\`\`\n${progressBar} ${percentage}%\n${historyCount}/${maxHistory} messages\n\`\`\``,
          inline: false
        },
        {
          name: '\u200b',
          value: '```ansi\n\x1b[1;33m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\x1b[0m\n```',
          inline: false
        },
        {
          name: 'ℹ️ Note',
          value: historyCount > 0
            ? '```diff\n+ History is maintained per user\n+ Maximum 20 messages stored\n+ Use !clear to reset history\n```'
            : '```yaml\nNo conversation history yet.\nStart chatting by mentioning me!\n```',
          inline: false
        }
      )
      .setFooter({
        text: `User: ${message.author.username}`,
        iconURL: message.author.displayAvatarURL()
      })
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  },
};
