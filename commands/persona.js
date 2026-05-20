const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'persona',
  description: 'Set AI personality for your conversations',
  usage: '!persona <personality>',
  execute: async (message, args, { conversationHistory }) => {
    if (args.length === 0) {
      const userId = message.author.id;
      const history = conversationHistory.get(userId) || [];

      const embed = new EmbedBuilder()
        .setColor('#00ffaa')
        .setTitle('🎭 AI Persona')
        .setDescription('```ansi\n\x1b[1;36m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\x1b[0m\n```')
        .addFields(
          {
            name: 'ℹ️ Current Status',
            value: history.length > 0 ? '```yaml\nPersona: Custom conversation style active\n```' : '```yaml\nPersona: Default\n```',
            inline: false
          },
          {
            name: '📖 Usage',
            value: '```fix\n!persona <personality description>\n```',
            inline: false
          },
          {
            name: '💡 Examples',
            value: '```yaml\n- !persona friendly teacher\n- !persona pirate captain\n- !persona shakespeare poet\n- !persona helpful assistant\n- !persona reset (to reset)\n```',
            inline: false
          }
        )
        .setFooter({
          text: `Requested by ${message.author.username}`,
          iconURL: message.author.displayAvatarURL()
        })
        .setTimestamp();

      return message.reply({ embeds: [embed] });
    }

    const persona = args.join(' ');
    const userId = message.author.id;

    if (persona.toLowerCase() === 'reset') {
      conversationHistory.delete(userId);
      const embed = new EmbedBuilder()
        .setColor('#00ff00')
        .setTitle('✅ Persona Reset')
        .setDescription('```ansi\n\x1b[1;32m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\x1b[0m\n```')
        .addFields({
          name: 'ℹ️ Success',
          value: '```yaml\nAI persona has been reset to default.\n```',
          inline: false
        })
        .setTimestamp();
      return message.reply({ embeds: [embed] });
    }

    conversationHistory.set(userId, [
      {
        role: 'user',
        parts: [{ text: `From now on, act as a ${persona}. Stay in character for all responses.` }],
      },
      {
        role: 'model',
        parts: [{ text: `Understood! I will now respond as a ${persona}. How can I help you?` }],
      }
    ]);

    const embed = new EmbedBuilder()
      .setColor('#00ffaa')
      .setTitle('🎭 Persona Set')
      .setDescription('```ansi\n\x1b[1;36m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\x1b[0m\n```')
      .addFields(
        {
          name: '✨ New Persona',
          value: `\`\`\`yaml\n${persona}\n\`\`\``,
          inline: false
        },
        {
          name: 'ℹ️ Note',
          value: '```fix\nThe AI will now respond with this personality.\nUse !persona reset to return to default.\n```',
          inline: false
        }
      )
      .setFooter({
        text: `Set by ${message.author.username}`,
        iconURL: message.author.displayAvatarURL()
      })
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  },
};
