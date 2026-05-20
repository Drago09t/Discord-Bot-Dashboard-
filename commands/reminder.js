const { EmbedBuilder } = require('discord.js');
const database = require('../database');

module.exports = {
    name: 'reminder',
    description: 'Set a reminder for yourself',
    usage: '!reminder <time> <message>',
    execute: async (message, args) => {
        if (args.length < 2) {
            return message.reply('Please provide time and message!\nUsage: `!reminder <time> <message>`\nExamples:\n• `!reminder 30m Buy groceries`\n• `!reminder 2h Meeting with team`\n• `!reminder 1d Happy birthday!`');
        }

        const timeArg = args[0].toLowerCase();
        const reminderText = args.slice(1).join(' ');

        // Parse time
        const timeMatch = timeArg.match(/^(\d+)([mhd])$/);
        if (!timeMatch) {
            return message.reply('❌ Invalid time format! Use format like: `30m`, `2h`, or `1d`');
        }

        const amount = parseInt(timeMatch[1]);
        const unit = timeMatch[2];

        let minutes = 0;
        switch (unit) {
            case 'm': minutes = amount; break;
            case 'h': minutes = amount * 60; break;
            case 'd': minutes = amount * 60 * 24; break;
        }

        if (minutes < 1 || minutes > 43200) { // Max 30 days
            return message.reply('❌ Time must be between 1 minute and 30 days!');
        }

        try {
            const remindAt = new Date(Date.now() + minutes * 60 * 1000);

            await database.createReminder(
                message.author.id,
                message.channel.id,
                reminderText,
                remindAt
            );

            const embed = new EmbedBuilder()
                .setColor('#00ff00')
                .setTitle('⏰ Reminder Set!')
                .addFields(
                    { name: '📝 Message', value: reminderText, inline: false },
                    { name: '⏱️ Time', value: `${amount}${unit}`, inline: true },
                    { name: '📅 Remind At', value: `<t:${Math.floor(remindAt.getTime() / 1000)}:F>`, inline: true }
                )
                .setFooter({
                    text: `Set by ${message.author.username}`,
                    iconURL: message.author.displayAvatarURL()
                })
                .setTimestamp();

            await message.reply({ embeds: [embed] });

        } catch (error) {
            console.error('Reminder error:', error);
            await message.reply('❌ Failed to create reminder. Please try again.');
        }
    },
};
