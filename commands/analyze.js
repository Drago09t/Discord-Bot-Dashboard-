const { EmbedBuilder } = require('discord.js');
const { GoogleGenerativeAI } = require('@google/generative-ai');

module.exports = {
  name: 'analyze',
  description: 'Analyze text sentiment and tone',
  usage: '!analyze <text>',
  execute: async (message, args) => {
    if (args.length === 0) {
      return message.reply('Please provide text to analyze! Usage: `!analyze <text>`');
    }

    const text = args.join(' ');

    if (text.length > 1500) {
      return message.reply('Text is too long! Maximum 1500 characters.');
    }

    try {
      await message.channel.sendTyping();

      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

      const prompt = `Analyze the following text and provide:\n1. Overall sentiment (positive/negative/neutral)\n2. Tone (formal/informal/casual/etc)\n3. Key themes or topics\n4. Writing style\n\nFormat with Discord markdown:\n\n${text}`;

      const result = await model.generateContent(prompt);
      const analysis = result.response.text();

      const embed = new EmbedBuilder()
        .setColor('#00ffaa')
        .setTitle('📊 Text Analysis')
        .setDescription('```ansi\n\x1b[1;36m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\x1b[0m\n```')
        .addFields(
          {
            name: '📝 Text',
            value: `\`\`\`${text.substring(0, 300)}${text.length > 300 ? '...' : ''}\`\`\``,
            inline: false
          },
          {
            name: '🔍 Analysis',
            value: analysis.substring(0, 1000),
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
      console.error('Analyze error:', error);
      await message.reply('Failed to analyze text. Please try again.');
    }
  },
};
