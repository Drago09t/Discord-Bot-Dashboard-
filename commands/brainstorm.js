const { EmbedBuilder } = require('discord.js');
const { GoogleGenerativeAI } = require('@google/generative-ai');

module.exports = {
  name: 'brainstorm',
  description: 'Generate creative ideas about a topic',
  usage: '!brainstorm <topic>',
  execute: async (message, args) => {
    if (args.length === 0) {
      return message.reply('Please provide a topic! Usage: `!brainstorm <topic>`\nExample: `!brainstorm mobile app ideas for students`');
    }

    const topic = args.join(' ');

    try {
      await message.channel.sendTyping();

      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

      const prompt = `Generate 5 creative and innovative ideas about: ${topic}\n\nFormat each idea with a title and brief description using Discord markdown. Keep each idea concise (2-3 sentences max). Make them practical and interesting.`;

      const result = await model.generateContent(prompt);
      const ideas = result.response.text();

      if (ideas.length > 3500) {
        const chunks = [];
        let currentChunk = '';
        const lines = ideas.split('\n');

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
            .setTitle(i === 0 ? `💡 Brainstorming: ${topic.substring(0, 150)}` : `💡 Ideas (${i + 1}/${chunks.length})`)
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
          .setTitle(`💡 Brainstorming: ${topic.substring(0, 200)}`)
          .setDescription(`\`\`\`ansi\n\x1b[1;36m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\x1b[0m\n\`\`\`\n${ideas}`)
          .setFooter({
            text: `Requested by ${message.author.username}`,
            iconURL: message.author.displayAvatarURL()
          })
          .setTimestamp();

        await message.reply({ embeds: [embed] });
      }
    } catch (error) {
      console.error('Brainstorm error:', error);
      await message.reply('Failed to generate ideas. Please try again.');
    }
  },
};
