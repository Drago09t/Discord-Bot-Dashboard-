const { EmbedBuilder } = require('discord.js');
const { GoogleGenerativeAI } = require('@google/generative-ai');

module.exports = {
    name: 'debate',
    description: 'AI presents multiple perspectives on a topic',
    usage: '!debate <topic>',
    execute: async (message, args) => {
        if (args.length === 0) {
            return message.reply('Please provide a topic to debate! Usage: `!debate <topic>`\nExample: `!debate Is AI beneficial for society?`');
        }

        const topic = args.join(' ');

        try {
            await message.channel.sendTyping();

            const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
            const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

            const prompt = `Present a balanced debate on: "${topic}"

Structure your response as:
## 🟢 Arguments For
Present 2-3 strong arguments supporting this position
## 🔴 Arguments Against
Present 2-3 strong arguments opposing this position
## ⚖️ Middle Ground / Nuance
Discuss the complexity and any middle-ground perspectives

Be objective and fair to all sides. Use Discord markdown formatting. Keep it concise but insightful.`;

            const result = await model.generateContent(prompt);
            const debate = result.response.text();

            if (debate.length > 1900) {
                const chunks = [];
                let currentChunk = '';
                const lines = debate.split('\n');

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
                        .setColor('#FEE75C')
                        .setTitle(i === 0 ? `⚖️ Debate: ${topic.substring(0, 150)}` : `⚖️ Debate (${i + 1}/${chunks.length})`)
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
                    .setColor('#FEE75C')
                    .setTitle(`⚖️ Debate: ${topic.substring(0, 200)}`)
                    .setDescription(debate)
                    .setFooter({
                        text: `Requested by ${message.author.username}`,
                        iconURL: message.author.displayAvatarURL()
                    })
                    .setTimestamp();

                await message.reply({ embeds: [embed] });
            }
        } catch (error) {
            console.error('Debate error:', error);
            await message.reply('❌ Failed to generate debate. Please try again.');
        }
    },
};
