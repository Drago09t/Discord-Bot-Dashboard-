const { EmbedBuilder } = require('discord.js');
const { GoogleGenerativeAI } = require('@google/generative-ai');

module.exports = {
    name: 'meme',
    description: 'Generate a funny meme caption or idea',
    usage: '!meme <topic>',
    execute: async (message, args) => {
        if (args.length === 0) {
            return message.reply('Please provide a topic! Usage: `!meme <topic>`\nExample: `!meme programming`');
        }

        const topic = args.join(' ');

        try {
            await message.channel.sendTyping();

            const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
            const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

            const prompt = `Create a hilarious meme caption or meme idea about: ${topic}

Format your response as:
**Meme Template:** [Suggest a popular meme template]
**Top Text:** [Caption for top]
**Bottom Text:** [Caption for bottom]
**Alt Caption:** [Alternative funny caption]

Be witty, relatable, and internet-culture savvy. Keep it clean and appropriate.`;

            const result = await model.generateContent(prompt);
            const memeIdea = result.response.text();

            const embed = new EmbedBuilder()
                .setColor('#FF6B6B')
                .setTitle(`😂 Meme Idea: ${topic}`)
                .setDescription(memeIdea)
                .setFooter({
                    text: `Requested by ${message.author.username}`,
                    iconURL: message.author.displayAvatarURL()
                })
                .setTimestamp();

            await message.reply({ embeds: [embed] });

        } catch (error) {
            console.error('Meme error:', error);
            await message.reply('❌ Failed to generate meme idea. Try again!');
        }
    },
};
