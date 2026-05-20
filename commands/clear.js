const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'clear',
  description: 'Clear your conversation history with the bot',
  usage: '!clear',
  execute: async (message, args, { conversationHistory }) => {
    const userId = message.author.id;
    const hadHistory = conversationHistory.has(userId);
    const messageCount = hadHistory ? conversationHistory.get(userId).length : 0;

    if (hadHistory) {
      conversationHistory.delete(userId);
    }

    const embed = new EmbedBuilder()
      .setColor(hadHistory ? '#00ff00' : '#ffa500')
      .setTitle(hadHistory ? '🗑️ History Cleared' : 'ℹ️ No History Found')
      .setDescription('```ansi\n\x1b[1;32m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\x1b[0m\n```')
      .addFields(
        {
          name: hadHistory ? '✅ Success' : '📭 Empty',
          value: hadHistory
            ? `Your conversation history has been cleared!\n\`\`\`diff\n- ${messageCount} messages deleted\n\`\`\``
            : 'You don\'t have any conversation history to clear.\n```yaml\nStart a conversation by mentioning me!\n```',
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
