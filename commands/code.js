const { EmbedBuilder } = require('discord.js');
const { GoogleGenerativeAI } = require('@google/generative-ai');

module.exports = {
  name: 'code',
  description: 'Generate or explain code',
  usage: '!code <language> <description or code>',
  execute: async (message, args) => {
    if (args.length < 2) {
      return message.reply('Please provide a language and description or code! Usage: `!code <language> <description>`\nExample: `!code python function to calculate fibonacci`');
    }

    const language = args[0].toLowerCase();
    const request = args.slice(1).join(' ');

    try {
      await message.channel.sendTyping();

      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

      const prompt = `You are a code assistant. For the following request in ${language}, provide code or explanation with proper Discord markdown formatting. Use code blocks with syntax highlighting:\n\n${request}`;

      const result = await model.generateContent(prompt);
      const response = result.response.text();

      if (response.length > 1900) {
        const chunks = [];
        let currentChunk = '';
        const lines = response.split('\n');

        for (const line of lines) {
          if ((currentChunk + line + '\n').length > 1800) {
            if (currentChunk) chunks.push(currentChunk.trim());
            currentChunk = line + '\n';
          } else {
            currentChunk += line + '\n';
          }
        }
        if (currentChunk) chunks.push(currentChunk.trim());

        for (let i = 0; i < chunks.length; i++) {
          const embed = new EmbedBuilder()
            .setColor('#00ffaa')
            .setTitle(`💻 Code ${chunks.length > 1 ? `(${i + 1}/${chunks.length})` : ''}`)
            .setDescription(chunks[i])
            .setFooter({
              text: `Language: ${language} | Requested by ${message.author.username}`,
              iconURL: message.author.displayAvatarURL()
            })
            .setTimestamp();

          await message.reply({ embeds: [embed] });
          if (i < chunks.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        }
      } else {
        const embed = new EmbedBuilder()
          .setColor('#00ffaa')
          .setTitle('💻 Code')
          .setDescription(response)
          .setFooter({
            text: `Language: ${language} | Requested by ${message.author.username}`,
            iconURL: message.author.displayAvatarURL()
          })
          .setTimestamp();

        await message.reply({ embeds: [embed] });
      }
    } catch (error) {
      console.error('Code error:', error);
      await message.reply('Failed to generate code. Please try again.');
    }
  },
};
