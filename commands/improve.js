const { EmbedBuilder } = require('discord.js');
const { GoogleGenerativeAI } = require('@google/generative-ai');

module.exports = {
  name: 'improve',
  description: 'Improve and enhance text',
  usage: '!improve <text>',
  execute: async (message, args) => {
    if (args.length === 0) {
      return message.reply('Please provide text to improve! Usage: `!improve <text>`');
    }

    const text = args.join(' ');

    if (text.length > 1500) {
      return message.reply('Text is too long! Maximum 1500 characters.');
    }

    try {
      await message.channel.sendTyping();

      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

      const prompt = `Improve the following text by making it more clear, professional, and well-written. Maintain the original meaning but enhance grammar, style, and readability:\n\n${text}`;

      const result = await model.generateContent(prompt);
      const improved = result.response.text();

      const embed = new EmbedBuilder()
        .setColor('#00ffaa')
        .setTitle('✨ Text Improvement')
        .setDescription('```ansi\n\x1b[1;36m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\x1b[0m\n```')
        .addFields(
          {
            name: '📝 Original',
            value: `\`\`\`${text}\`\`\``,
            inline: false
          },
          {
            name: '✨ Improved',
            value: improved.substring(0, 1000),
            inline: false
          }
        )
        .setFooter({
          text: `Requested by ${message.author.username}`,
          iconURL: message.author.displayAvatarURL()
        })
        .setTimestamp();

      await message.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Improve error:', error);
      await message.reply('Failed to improve text. Please try again.');
    }
  },
};
