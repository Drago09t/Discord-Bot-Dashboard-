const { EmbedBuilder } = require('discord.js');
const { GoogleGenerativeAI } = require('@google/generative-ai');

module.exports = {
    name: 'joke',
    description: 'Get an AI-generated joke',
    usage: '!joke [type]',
    execute: async (message, args) => {
        const types = ['general', 'dad', 'pun', 'knock-knock', 'programming'];
        const type = args.length > 0 && types.includes(args[0].toLowerCase()) ? args[0].toLowerCase() : 'general';

        try {
            await message.channel.sendTyping();

            const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
            const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

            const typePrompts = {
                general: 'Tell me a clean, funny joke suitable for all ages.',
                dad: 'Tell me a classic dad joke (groan-worthy pun).',
                pun: 'Tell me a clever pun or wordplay joke.',
                'knock-knock': 'Tell me a knock-knock joke.',
                programming: 'Tell me a programming or tech joke that developers would find funny.'
            };

            const prompt = `${typePrompts[type]} Keep it short (2-4 lines max) and make it actually funny!`;

            const result = await model.generateContent(prompt);
            const joke = result.response.text();

            const embed = new EmbedBuilder()
                .setColor('#FFD700')
                .setTitle(`😂 ${type.charAt(0).toUpperCase() + type.slice(1)} Joke`)
                .setDescription(joke)
                .setFooter({
                    text: `Requested by ${message.author.username} • Type: ${type}`,
                    iconURL: message.author.displayAvatarURL()
                })
                .setTimestamp();

            await message.reply({ embeds: [embed] });

        } catch (error) {
            console.error('Joke error:', error);
            await message.reply('❌ Failed to generate a joke. Try again!');
        }
    },
};
