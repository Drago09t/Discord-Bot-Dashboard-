const { EmbedBuilder } = require('discord.js');
const { GoogleGenerativeAI } = require('@google/generative-ai');

module.exports = {
    name: 'compare',
    description: 'Compare two or more things with AI analysis',
    usage: '!compare <item1> vs <item2> [vs <item3>...]',
    execute: async (message, args) => {
        if (args.length < 3 || !args.join(' ').includes(' vs ')) {
            return message.reply('Please provide items to compare! Usage: `!compare <item1> vs <item2> [vs <item3>...]`\nExample: `!compare Python vs JavaScript vs Java`');
        }

        const fullText = args.join(' ');
        const items = fullText.split(' vs ').map(item => item.trim());

        if (items.length < 2) {
            return message.reply('❌ Please provide at least 2 items to compare using "vs"');
        }

        try {
            await message.channel.sendTyping();

            const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
            const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

            const prompt = `Provide a detailed comparison of: ${items.join(' vs ')}

Structure your comparison:
## 🔵 ${items[0]}
Key characteristics, strengths, weaknesses

## 🟢 ${items[1]}
Key characteristics, strengths, weaknesses
${items.length > 2 ? `\n## 🟡 ${items.slice(2).join('\n## 🟡 ')}\nKey characteristics, strengths, weaknesses for each` : ''}

## ⚖️ Head-to-Head Comparison
Compare them across key dimensions (performance, cost, ease of use, etc.)

## 🎯 Verdict
Which is better for what use cases?

Use Discord markdown formatting. Be objective and comprehensive!`;

            const result = await model.generateContent(prompt);
            const comparison = result.response.text();

            if (comparison.length > 1900) {
                const chunks = [];
                let currentChunk = '';
                const lines = comparison.split('\n');

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
                        .setColor('#3498DB')
                        .setTitle(i === 0 ? `⚖️ Comparing: ${items.join(' vs ').substring(0, 120)}` : `⚖️ Comparison (${i + 1}/${chunks.length})`)
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
                    .setColor('#3498DB')
                    .setTitle(`⚖️ Comparing: ${items.join(' vs ').substring(0, 180)}`)
                    .setDescription(comparison)
                    .setFooter({
                        text: `Requested by ${message.author.username}`,
                        iconURL: message.author.displayAvatarURL()
                    })
                    .setTimestamp();

                await message.reply({ embeds: [embed] });
            }
        } catch (error) {
            console.error('Compare error:', error);
            await message.reply('❌ Failed to generate comparison. Please try again.');
        }
    },
};
