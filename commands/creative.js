const { EmbedBuilder } = require('discord.js');
const { GoogleGenerativeAI } = require('@google/generative-ai');

module.exports = {
    name: 'creative',
    description: 'Generate creative content (stories, poems, ideas, etc.)',
    usage: '!creative <type> <prompt>',
    execute: async (message, args) => {
        if (args.length < 2) {
            return message.reply(`Please specify type and prompt! Usage: \`!creative <type> <prompt>\`

**Available types:**
• \`story\` - Short story
• \`poem\` - Poem or verse
• \`idea\` - Creative ideas
• \`dialogue\` - Dramatic dialogue
• \`joke\` - Jokes or humor
• \`lyrics\` - Song lyrics

Example: \`!creative story A robot discovers emotions\``);
        }

        const type = args[0].toLowerCase();
        const prompt = args.slice(1).join(' ');

        const validTypes = ['story', 'poem', 'idea', 'dialogue', 'joke', 'lyrics'];
        if (!validTypes.includes(type)) {
            return message.reply(`❌ Invalid type! Use one of: ${validTypes.map(t => `\`${t}\``).join(', ')}`);
        }

        try {
            await message.channel.sendTyping();

            const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
            const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

            const typePrompts = {
                story: `Write a compelling short story (200-300 words) about: ${prompt}. Include vivid descriptions and an engaging narrative.`,
                poem: `Write a creative, well-structured poem about: ${prompt}. Use literary devices and emotional depth.`,
                idea: `Generate 5-7 creative and innovative ideas for: ${prompt}. Be imaginative and practical.`,
                dialogue: `Write an engaging dialogue scene (5-8 exchanges) involving: ${prompt}. Make it dramatic and character-driven.`,
                joke: `Generate 3-5 clever, funny jokes about: ${prompt}. Be witty and appropriate.`,
                lyrics: `Write creative song lyrics (2-3 verses with a chorus) about: ${prompt}. Include rhythm and emotional resonance.`
            };

            const fullPrompt = typePrompts[type] + '\n\nUse Discord markdown formatting. Be creative and engaging!';

            const result = await model.generateContent(fullPrompt);
            const content = result.response.text();

            const emojis = {
                story: '📖',
                poem: '✍️',
                idea: '💡',
                dialogue: '🎭',
                joke: '😂',
                lyrics: '🎵'
            };

            if (content.length > 1900) {
                const chunks = [];
                let currentChunk = '';
                const lines = content.split('\n');

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
                        .setColor('#9B59B6')
                        .setTitle(i === 0 ? `${emojis[type]} ${type.charAt(0).toUpperCase() + type.slice(1)}: ${prompt.substring(0, 120)}` : `${emojis[type]} (${i + 1}/${chunks.length})`)
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
                    .setColor('#9B59B6')
                    .setTitle(`${emojis[type]} ${type.charAt(0).toUpperCase() + type.slice(1)}: ${prompt.substring(0, 150)}`)
                    .setDescription(content)
                    .setFooter({
                        text: `Requested by ${message.author.username}`,
                        iconURL: message.author.displayAvatarURL()
                    })
                    .setTimestamp();

                await message.reply({ embeds: [embed] });
            }
        } catch (error) {
            console.error('Creative error:', error);
            await message.reply('❌ Failed to generate creative content. Please try again.');
        }
    },
};
