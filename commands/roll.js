const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'roll',
    description: 'Roll dice (supports XdY format like 2d6)',
    usage: '!roll [dice]',
    execute: async (message, args) => {
        let numDice = 1;
        let numSides = 6;

        if (args.length > 0) {
            const input = args[0].toLowerCase();

            if (input.includes('d')) {
                const [dice, sides] = input.split('d');
                numDice = parseInt(dice) || 1;
                numSides = parseInt(sides) || 6;
            } else {
                numSides = parseInt(input) || 6;
            }
        }

        // Limits
        numDice = Math.min(Math.max(numDice, 1), 100);
        numSides = Math.min(Math.max(numSides, 2), 1000);

        const rolls = [];
        let total = 0;

        for (let i = 0; i < numDice; i++) {
            const roll = Math.floor(Math.random() * numSides) + 1;
            rolls.push(roll);
            total += roll;
        }

        const rollsDisplay = rolls.length <= 20
            ? rolls.map(r => `\`${r}\``).join(' ')
            : `${rolls.slice(0, 20).map(r => `\`${r}\``).join(' ')} ... (+${rolls.length - 20} more)`;

        const embed = new EmbedBuilder()
            .setColor('#3498db')
            .setTitle('🎲 Dice Roll')
            .addFields(
                { name: '🎯 Roll', value: `${numDice}d${numSides}`, inline: true },
                { name: '📊 Total', value: `**${total}**`, inline: true },
                { name: '\u200b', value: '\u200b', inline: true },
                { name: '🎲 Individual Rolls', value: rollsDisplay, inline: false }
            )
            .setFooter({
                text: `Rolled by ${message.author.username}`,
                iconURL: message.author.displayAvatarURL()
            })
            .setTimestamp();

        await message.reply({ embeds: [embed] });
    },
};
