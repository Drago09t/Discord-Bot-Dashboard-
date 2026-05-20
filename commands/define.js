const { EmbedBuilder } = require('discord.js');
const { GoogleGenerativeAI } = require('@google/generative-ai');

module.exports = {
    name: 'define',
    description: 'Define technical or complex terms with detailed explanations',
    usage: '!define <term>',
    execute: async (message, args) => {
        if (args.length === 0) {
            return message.reply('Please provide a term to define! Usage: `!define <term>`\nExample: `!define machine learning`');
        }

        const term = args.join(' ');

        try {
            await message.channel.sendTyping();

            const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
            const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

            const prompt = `Provide a comprehensive definition for: "${term}"

Structure your definition:
## 📖 Definition
Clear, concise definition in 1-2 sentences

## 🔍 Detailed Explanation
Deeper explanation of the concept

## 💡 Context & Usage
How and where it's used/applied

## 📌 Example
A practical example demonstrating the term

## 🔗 Related Terms
2-3 related concepts (if applicable)

Use Discord markdown formatting. Be educational and accessible!`;

            const result = await model.generateContent(prompt);
            const definition = result.response.text();

            if (definition.length > 1900) {
                const chunks = [];
                let currentChunk = '';
                const lines = definition.split('\n');

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
                        .setColor('#1ABC9C')
                        .setTitle(i === 0 ? `📖 Definition: ${term.substring(0, 170)}` : `📖 Definition (${i + 1}/${chunks.length})`)
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
                    .setColor('#1ABC9C')
                    .setTitle(`📖 Definition: ${term.substring(0, 200)}`)
                    .setDescription(definition)
                    .setFooter({
                        text: `Requested by ${message.author.username}`,
                        iconURL: message.author.displayAvatarURL()
                    })
                    .setTimestamp();

                await message.reply({ embeds: [embed] });
            }
        } catch (error) {
            console.error('Define error:', error);
            await message.reply('❌ Failed to generate definition. Please try again.');
        }
    },
};
