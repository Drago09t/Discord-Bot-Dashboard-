const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const voiceManager = require('../voiceManager');
const voiceDB = require('../voiceDB');

module.exports = {
    name: 'voicestop',
    description: 'Disable 24/7 voice and disconnect from voice channel',
    usage: '!voicestop [channel]',
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
            let targetChannelId;
            let targetChannelName;

            if (args.length > 0) {
                // Channel mentioned or ID provided
                const channelId = args[0].replace(/[<#>]/g, '');
                const channel = message.guild.channels.cache.get(channelId);

                if (channel) {
                    targetChannelId = channel.id;
                    targetChannelName = channel.name;
                } else {
                    // Try to remove by ID even if channel doesn't exist
                    const is247 = await voiceDB.is247Channel(channelId);
                    if (is247) {
                        await voiceDB.remove247Channel(channelId);
                        voiceManager.leaveChannel(message.guild.id);

                        const embed = new EmbedBuilder()
                            .setColor('#FFA500')
                            .setTitle('✅ 24/7 Voice Disabled')
                            .setDescription('Removed a deleted channel from the 24/7 voice database.')
                            .setFooter({
                                text: `Disabled by ${message.author.username}`,
                                iconURL: message.author.displayAvatarURL()
                            })
                            .setTimestamp();

                        return message.reply({ embeds: [embed] });
                    } else {
                        return message.reply('❌ Could not find that channel in the 24/7 voice list.');
                    }
                }
            } else {
                // Check if bot is connected to voice in this guild
                const connectionInfo = voiceManager.getConnection(message.guild.id);
                if (!connectionInfo) {
                    return message.reply('❌ I\'m not connected to any voice channel in this server!');
                }
                targetChannelId = connectionInfo.channelId;
                targetChannelName = connectionInfo.channelName;
            }

            // Check if it's a 24/7 channel
            const is247 = await voiceDB.is247Channel(targetChannelId);

            if (!is247) {
                // Still try to disconnect if connected
                const disconnected = voiceManager.leaveChannel(message.guild.id);
                if (disconnected) {
                    return message.reply(`✅ Disconnected from voice, but it wasn't a 24/7 channel.`);
                } else {
                    return message.reply(`⚠️ That channel is not set up as a 24/7 voice channel.`);
                }
            }

            // Remove from database
            await voiceDB.remove247Channel(targetChannelId);

            // Disconnect from voice
            voiceManager.leaveChannel(message.guild.id);

            // Send success message
            const embed = new EmbedBuilder()
                .setColor('#ff9900')
                .setTitle('✅ 24/7 Voice Disabled')
                .setDescription(`Disabled 24/7 voice and disconnected from **${targetChannelName}**`)
                .addFields(
                    {
                        name: '📝 What Changed',
                        value: '• Bot disconnected from voice\n• 24/7 auto-reconnect disabled\n• Channel removed from 24/7 list',
                        inline: false
                    },
                    {
                        name: '🔄 To Re-enable',
                        value: `Use \`!voice24 #${targetChannelName}\` to enable 24/7 again.`,
                        inline: false
                    }
                )
                .setFooter({
                    text: `Disabled by ${message.author.username}`,
                    iconURL: message.author.displayAvatarURL()
                })
                .setTimestamp();

            await message.reply({ embeds: [embed] });

        } catch (error) {
            console.error('VoiceStop error:', error);
            await message.reply('❌ An error occurred while disabling 24/7 voice. Please try again.');
        }
    },
};
