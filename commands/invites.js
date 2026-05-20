const { EmbedBuilder } = require('discord.js');
const database = require('../database');

module.exports = {
    name: 'invites',
    description: 'Check your current invite statistics',
    usage: '!invites [@user]',
    execute: async (message, args, context) => {
        const target = message.mentions.users.first() || message.author;

        try {
            const stats = await database.getUserInvites(target.id, message.guild.id);
            const total = (stats.regular || 0) + (stats.bonus || 0) - (stats.leaves || 0);

            const embed = new EmbedBuilder()
                .setTitle(`📩 Invite Stats: ${target.username}`)
                .setColor(0x3498db)
                .setThumbnail(target.displayAvatarURL({ dynamic: true }))
                .addFields(
                    { name: '✨ Total', value: `**${total}**`, inline: true },
                    { name: '✅ Regular', value: `${stats.regular || 0}`, inline: true },
                    { name: '❌ Leaves', value: `${stats.leaves || 0}`, inline: true },
                    { name: '🎭 Fake', value: `${stats.fake || 0}`, inline: true },
                    { name: '🎁 Bonus', value: `${stats.bonus || 0}`, inline: true }
                )
                .setFooter({ text: `Requested by ${message.author.tag}` })
                .setTimestamp();

            await message.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Error in invites command:', error);
            message.reply('❌ Failed to fetch invite stats.');
        }
    }
};
