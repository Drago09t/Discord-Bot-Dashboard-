const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const channelDB = require('../channelDB');

module.exports = {
    name: 'removeai',
    description: 'Remove AI channel designation from a channel',
    usage: '!removeai <channel>',
    execute: async (message, args) => {
        // Check if user has administrator permissions
        if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return message.reply('❌ You need **Administrator** permissions to use this command.');
        }

        // DM check
        if (!message.guild) {
            return message.reply('❌ This command can only be used in a server, not in DMs.');
        }

        try {
            // Determine which channel to remove
            let targetChannel;

            if (args.length > 0) {
                // Channel mentioned or ID provided
                const channelId = args[0].replace(/[<#>]/g, '');
                targetChannel = message.guild.channels.cache.get(channelId);

                if (!targetChannel) {
                    // Try to remove by ID even if channel doesn't exist
                    const removed = await channelDB.removeChannel(channelId);

                    if (removed) {
                        const embed = new EmbedBuilder()
                            .setColor('#FFA500')
                            .setTitle('✅ AI Channel Removed')
                            .setDescription('Removed a deleted channel from the AI channel database.')
                            .setFooter({
                                text: `Removed by ${message.author.username}`,
                                iconURL: message.author.displayAvatarURL()
                            })
                            .setTimestamp();

                        return message.reply({ embeds: [embed] });
                    } else {
                        return message.reply('❌ Could not find that channel in the AI channel list.');
                    }
                }
            } else {
                // Use current channel
                targetChannel = message.channel;
            }

            // Check if it's an AI channel
            const isAIChannel = await channelDB.isAIChannel(targetChannel.id);

            if (!isAIChannel) {
                return message.reply(`⚠️ ${targetChannel} is not set up as an AI channel.`);
            }

            // Remove channel from database
            await channelDB.removeChannel(targetChannel.id);

            // Send success message
            const embed = new EmbedBuilder()
                .setColor('#ff9900')
                .setTitle('✅ AI Channel Removed')
                .setDescription(`${targetChannel} is no longer an AI channel.`)
                .addFields(
                    {
                        name: '📝 What Changed',
                        value: 'The bot will no longer automatically respond to messages in this channel.',
                        inline: false
                    },
                    {
                        name: '💬 How to Chat',
                        value: 'You can still chat with the bot by:\n• Mentioning the bot\n• Using commands\n• Sending DMs',
                        inline: false
                    },
                    {
                        name: '🔄 Re-enable',
                        value: `Use \`!setup #${targetChannel.name}\` to make it an AI channel again.`,
                        inline: false
                    }
                )
                .setFooter({
                    text: `Removed by ${message.author.username}`,
                    iconURL: message.author.displayAvatarURL()
                })
                .setTimestamp();

            await message.reply({ embeds: [embed] });

            // Send notification in the removed channel if different
            if (targetChannel.id !== message.channel.id) {
                const notificationEmbed = new EmbedBuilder()
                    .setColor('#ff9900')
                    .setTitle('⚠️ AI Channel Deactivated')
                    .setDescription('This channel is no longer an AI-enabled channel.')
                    .addFields({
                        name: 'ℹ️ To chat with the bot',
                        value: 'Mention the bot or use commands.',
                        inline: false
                    })
                    .setTimestamp();

                await targetChannel.send({ embeds: [notificationEmbed] });
            }

        } catch (error) {
            console.error('Remove AI error:', error);
            await message.reply('❌ An error occurred while removing the AI channel. Please try again.');
        }
    },
};
