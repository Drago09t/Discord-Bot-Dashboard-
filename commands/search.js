const { EmbedBuilder } = require('discord.js');
const { GoogleGenerativeAI } = require('@google/generative-ai');

module.exports = {
    name: 'search',
    description: 'Search a topic and get AI-summarized results',
    usage: '!search <query>',
    execute: async (message, args) => {
        if (args.length === 0) {
            return message.reply('Please provide a search query! Usage: `!search <query>`\nExample: `!search latest AI developments`');
        }

        const query = args.join(' ');

        try {
            await message.channel.sendTyping();

            const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
            const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

            const prompt = `Provide a comprehensive answer about: "${query}"

Include:
1. **Overview:** Brief summary (2-3 sentences)
2. **Key Points:** 3-5 important points
3. **Additional Info:** Relevant details

Be factual, current, and well-sourced. Use Discord markdown formatting.`;

            const result = await model.generateContent(prompt);
            const searchResult = result.response.text();

            if (searchResult.length > 1900) {
                const chunks = [];
                let currentChunk = '';
                const lines = searchResult.split('\n');

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
                        .setColor('#3498db')
                        .setTitle(i === 0 ? `🔍 Search: ${query.substring(0, 150)}` : `🔍 Search Results (${i + 1}/${chunks.length})`)
                        .setDescription(chunks[i])
                        .setFooter({
                            text: `Searched by ${message.author.username}`,
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
                    .setColor('#3498db')
                    .setTitle(`🔍 Search: ${query}`)
                    .setDescription(searchResult)
                    .setFooter({
                        text: `Searched by ${message.author.username}`,
                        iconURL: message.author.displayAvatarURL()
                    })
                    .setTimestamp();

                await message.reply({ embeds: [embed] });
            }

        } catch (error) {
            console.error('Search error:', error);
            await message.reply('❌ Failed to search. Please try again.');
        }
    },
};
