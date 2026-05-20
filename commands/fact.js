const { EmbedBuilder } = require('discord.js');
const { GoogleGenerativeAI } = require('@google/generative-ai');

module.exports = {
    name: 'fact',
    description: 'Get interesting facts about any topic',
    usage: '!fact <topic>',
    execute: async (message, args) => {
        if (args.length === 0) {
            return message.reply('Please provide a topic! Usage: `!fact <topic>`\nExample: `!fact space exploration`');
        }

        const topic = args.join(' ');

        try {
            await message.channel.sendTyping();

            const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
            const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

            const prompt = `Provide 5-7 fascinating, lesser-known facts about: ${topic}

Format each fact clearly with Discord markdown:
• Use **bold** for key terms
• Use numbers or bullet points
• Make facts interesting and surprising
• Include context where helpful
• Verify accuracy

Keep facts concise but engaging!`;

            const result = await model.generateContent(prompt);
            const facts = result.response.text();

            if (facts.length > 1900) {
                const chunks = [];
                let currentChunk = '';
                const lines = facts.split('\n');

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
                        .setColor('#E74C3C')
                        .setTitle(i === 0 ? `🔍 Interesting Facts: ${topic.substring(0, 150)}` : `🔍 Facts (${i + 1}/${chunks.length})`)
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
                    .setColor('#E74C3C')
                    .setTitle(`🔍 Interesting Facts: ${topic.substring(0, 200)}`)
                    .setDescription(facts)
                    .setFooter({
                        text: `Requested by ${message.author.username}`,
                        iconURL: message.author.displayAvatarURL()
                    })
                    .setTimestamp();

                await message.reply({ embeds: [embed] });
            }
        } catch (error) {
            console.error('Fact error:', error);
            await message.reply('❌ Failed to retrieve facts. Please try again.');
        }
    },
};
