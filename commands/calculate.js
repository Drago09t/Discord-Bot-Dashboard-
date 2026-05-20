const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'calculate',
    description: 'Calculate mathematical expressions',
    usage: '!calculate <expression>',
    execute: async (message, args) => {
        if (args.length === 0) {
            return message.reply('Please provide an expression! Usage: `!calculate <expression>`\nExample: `!calculate 2 + 2 * 3`');
        }

        const expression = args.join(' ');

        try {
            // Basic security: only allow numbers, operators, and parentheses
            if (!/^[0-9+\-*/(). ]+$/.test(expression)) {
                return message.reply('❌ Invalid expression! Only use numbers and operators (+, -, *, /, (, ))');
            }

            // Evaluate (using Function is safer than eval)
            const result = Function(`'use strict'; return (${expression})`)();

            if (!isFinite(result)) {
                return message.reply('❌ Result is not a valid number!');
            }

            const embed = new EmbedBuilder()
                .setColor('#3498db')
                .setTitle('🧮 Calculator')
                .addFields(
                    { name: '📝 Expression', value: `\`${expression}\``, inline: false },
                    { name: '✅ Result', value: `\`${result}\``, inline: false }
                )
                .setFooter({
                    text: `Calculated by ${message.author.username}`,
                    iconURL: message.author.displayAvatarURL()
                })
                .setTimestamp();

            await message.reply({ embeds: [embed] });

        } catch (error) {
            await message.reply('❌ Invalid mathematical expression!');
        }
    },
};
