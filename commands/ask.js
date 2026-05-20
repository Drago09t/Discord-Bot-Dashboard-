const { EmbedBuilder } = require('discord.js');
const { GoogleGenerativeAI } = require('@google/generative-ai');

module.exports = {
  name: 'ask',
  description: 'Ask AI a specific question',
  usage: '!ask <question>',
  execute: async (message, args) => {
    if (args.length === 0) {
      return message.reply('Please ask a question! Usage: `!ask <question>`\nExample: `!ask What is quantum computing?`');
    }

    const question = args.join(' ');

    try {
      await message.channel.sendTyping();

      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

      const prompt = `Answer the following question concisely and accurately with proper Discord markdown formatting:\n\n${question}`;

      const result = await model.generateContent(prompt);
      const answer = result.response.text();

      if (answer.length > 1900) {
        const chunks = [];
        let currentChunk = '';
        const lines = answer.split('\n');

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
            .setTitle(i === 0 ? `❓ ${question.substring(0, 150)}` : `❓ Answer (${i + 1}/${chunks.length})`)
            .setDescription(chunks[i])
            .setFooter({
              text: `Requested by ${message.author.username}`,
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
          .setTitle(`❓ ${question.substring(0, 200)}`)
          .setDescription(answer)
          .setFooter({
            text: `Requested by ${message.author.username}`,
            iconURL: message.author.displayAvatarURL()
          })
          .setTimestamp();

        await message.reply({ embeds: [embed] });
      }
    } catch (error) {
      console.error('Ask error:', error);
      await message.reply('Failed to answer question. Please try again.');
    }
  },
};
