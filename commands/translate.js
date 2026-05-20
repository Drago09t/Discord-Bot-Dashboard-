const { EmbedBuilder } = require('discord.js');
const { GoogleGenerativeAI } = require('@google/generative-ai');

module.exports = {
  name: 'translate',
  description: 'Translate text to another language',
  usage: '!translate <language> <text>',
  execute: async (message, args) => {
    if (args.length < 2) {
      return message.reply('Please provide a target language and text! Usage: `!translate <language> <text>`\nExample: `!translate spanish Hello, how are you?`');
    }

    const targetLang = args[0];
    const text = args.slice(1).join(' ');

    if (text.length > 1000) {
      return message.reply('Text is too long! Maximum 1000 characters.');
    }

    try {
      await message.channel.sendTyping();

      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

      const prompt = `Translate the following text to ${targetLang}. Only provide the translation, no explanations:\n\n${text}`;

      const result = await model.generateContent(prompt);
      const translation = result.response.text();

      const embed = new EmbedBuilder()
        .setColor('#00ffaa')
        .setTitle('🌐 Translation')
        .setDescription('```ansi\n\x1b[1;36m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\x1b[0m\n```')
        .addFields(
          {
            name: '📝 Original',
            value: `\`\`\`${text.substring(0, 500)}\`\`\``,
            inline: false
          },
          {
            name: `🌐 Translation (${targetLang})`,
            value: `\`\`\`${translation.substring(0, 500)}\`\`\``,
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
      console.error('Translation error:', error);
      await message.reply('Failed to translate text. Please try again.');
    }
  },
};
