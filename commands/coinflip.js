const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'coinflip',
    description: 'Flip a coin',
    usage: '!coinflip',
    execute: async (message, args) => {
        const result = Math.random() < 0.5 ? 'Heads' : 'Tails';
        const emoji = result === 'Heads' ? '👑' : '⚪';
        const color = result === 'Heads' ? '#FFD700' : '#C0C0C0';

        const embed = new EmbedBuilder()
            .setColor(color)
            .setTitle('🪙 Coin Flip')
            .setDescription(`${emoji} **${result}!** ${emoji}`)
            .setFooter({
                text: `Flipped by ${message.author.username}`,
                iconURL: message.author.displayAvatarURL()
            })
            .setTimestamp();

        await message.reply({ embeds: [embed] });
    },
};
