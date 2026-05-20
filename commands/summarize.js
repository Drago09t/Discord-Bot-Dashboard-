const { EmbedBuilder } = require('discord.js');
const { GoogleGenerativeAI } = require('@google/generative-ai');

module.exports = {
  name: 'summarize',
  description: 'Summarize long text into key points',
  usage: '!summarize <text>',
  execute: async (message, args) => {
    if (args.length === 0) {
      return message.reply('Please provide text to summarize! Usage: `!summarize <text>`');
    }

    const text = args.join(' ');

    if (text.length < 50) {
      return message.reply('Text is too short to summarize! Provide at least 50 characters.');
    }

    if (text.length > 3000) {
      return message.reply('Text is too long! Maximum 3000 characters.');
    }

    try {
      await message.channel.sendTyping();

      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

      const prompt = `Summarize the following text into 3-5 key bullet points. Use Discord markdown formatting:\n\n${text}`;

      const result = await model.generateContent(prompt);
      const summary = result.response.text();

      const embed = new EmbedBuilder()
        .setColor('#00ffaa')
        .setTitle('📄 Summary')
        .setDescription('```ansi\n\x1b[1;36m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\x1b[0m\n```')
        .addFields(
          {
            name: '📝 Original Text',
            value: `\`\`\`${text.substring(0, 300)}${text.length > 300 ? '...' : ''}\`\`\``,
            inline: false
          },
          {
            name: '✨ Summary',
            value: summary,
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
      console.error('Summarize error:', error);
      await message.reply('Failed to summarize text. Please try again.');
    }
  },
};
