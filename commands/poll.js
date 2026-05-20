const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'poll',
    description: 'Create a poll with up to 10 options',
    usage: '!poll <question> | <option1> | <option2> | ...',
    execute: async (message, args) => {
        if (args.length === 0) {
            return message.reply('Please provide a question and options!\nUsage: `!poll <question> | <option1> | <option2> | ...`\nExample: `!poll What\'s your favorite color? | Red | Blue | Green`');
        }

        const input = args.join(' ');
        const parts = input.split('|').map(p => p.trim());

        if (parts.length < 3) {
            return message.reply('❌ Please provide at least a question and 2 options!');
        }

        const question = parts[0];
        const options = parts.slice(1, 11); // Max 10 options

        const numberEmojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];

        const optionsText = options.map((opt, i) => `${numberEmojis[i]} ${opt}`).join('\n');

        const embed = new EmbedBuilder()
            .setColor('#00ffaa')
            .setTitle(`📊 Poll: ${question}`)
            .setDescription(optionsText)
            .setFooter({
                text: `Poll created by ${message.author.username} • Vote below!`,
                iconURL: message.author.displayAvatarURL()
            })
            .setTimestamp();

        const pollMessage = await message.channel.send({ embeds: [embed] });

        // Add reactions
        for (let i = 0; i < options.length; i++) {
            await pollMessage.react(numberEmojis[i]);
        }

        // Delete the command message
        await message.delete().catch(() => { });
    },
};
