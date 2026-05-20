const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const rankingDB = require('../rankingDB');

module.exports = {
    name: 'setxp',
    description: 'Set a user\'s XP (Admin only)',
    usage: '!setxp <@user> <amount>',
    execute: async (message, args) => {
        if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return message.reply('❌ You need **Administrator** permissions to use this command.');
        }

        if (!message.guild) {
            return message.reply('❌ This command can only be used in a server!');
        }

        if (args.length < 2) {
            return message.reply('Please provide a user and XP amount!\nUsage: `!setxp <@user> <amount>`\nExample: `!setxp @User 1000`');
        }

        const userId = args[0].replace(/[<@!>]/g, '');
        const xpAmount = parseInt(args[1]);

        if (isNaN(xpAmount) || xpAmount < 0) {
            return message.reply('❌ Please provide a valid XP amount (positive number)!');
        }

        try {
            const member = message.guild.members.cache.get(userId);
            if (!member) {
                return message.reply('❌ User not found!');
            }

            const user = member.user;
            const updatedUser = await rankingDB.setXP(user.id, message.guild.id, user.username, xpAmount);

            const embed = new EmbedBuilder()
                .setColor('#00ff00')
                .setTitle('✅ XP Updated')
                .addFields(
                    { name: '👤 User', value: user.username, inline: true },
                    { name: '📊 New XP', value: `${updatedUser.xp.toLocaleString()}`, inline: true },
                    { name: '🎯 New Level', value: `${updatedUser.level}`, inline: true }
                )
                .setFooter({
                    text: `Updated by ${message.author.username}`,
                    iconURL: message.author.displayAvatarURL()
                })
                .setTimestamp();

            await message.reply({ embeds: [embed] });

        } catch (error) {
            console.error('SetXP error:', error);
            await message.reply('❌ Failed to set XP. Please try again.');
        }
    },
};
