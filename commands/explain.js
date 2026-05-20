const { EmbedBuilder } = require('discord.js');
const { GoogleGenerativeAI } = require('@google/generative-ai');

module.exports = {
  name: 'explain',
  description: 'Explain complex topics in simple, easy-to-understand terms',
  usage: '!explain <topic>',
  execute: async (message, args) => {
    if (args.length === 0) {
      return message.reply('Please provide a topic to explain! Usage: `!explain <topic>`\nExample: `!explain quantum entanglement`');
    }

    const topic = args.join(' ');

    try {
      await message.channel.sendTyping();

      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

      const prompt = `Explain "${topic}" in simple, easy-to-understand terms. Break down complex concepts into digestible parts. Use analogies where helpful. Format with Discord markdown for clarity. Structure your explanation with:
1. A simple definition
2. Key concepts explained simply
3. A practical example or analogy
4. Why it matters

Keep it concise but thorough.`;

      const result = await model.generateContent(prompt);
      const explanation = result.response.text();

      if (explanation.length > 1900) {
        const chunks = [];
        let currentChunk = '';
        const lines = explanation.split('\n');

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
            .setColor('#5865F2')
            .setTitle(i === 0 ? `📚 Explaining: ${topic.substring(0, 150)}` : `📚 Explanation (${i + 1}/${chunks.length})`)
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
          .setColor('#5865F2')
          .setTitle(`📚 Explaining: ${topic.substring(0, 200)}`)
          .setDescription(explanation)
          .setFooter({
            text: `Requested by ${message.author.username}`,
            iconURL: message.author.displayAvatarURL()
          })
          .setTimestamp();

        await message.reply({ embeds: [embed] });
      }
    } catch (error) {
      console.error('Explain error:', error);
      await message.reply('❌ Failed to generate explanation. Please try again.');
    }
  },
};
