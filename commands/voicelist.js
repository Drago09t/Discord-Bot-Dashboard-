const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const voiceManager = require('../voiceManager');
const voiceDB = require('../voiceDB');

module.exports = {
    name: 'voicelist',
    description: 'List all 24/7 voice connections',
    usage: '!voicelist',
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
            // Get all 24/7 channels for this guild
            const voice247Channels = await voiceDB.get247ChannelsByGuild(message.guild.id);

            if (voice247Channels.length === 0) {
                const embed = new EmbedBuilder()
                    .setColor('#FFA500')
                    .setTitle('🔊 24/7 Voice Connections')
                    .setDescription('No 24/7 voice channels are configured in this server.')
                    .addFields({
                        name: '💡 How to Set Up',
                        value: 'Use `!voice24 #voice-channel` to enable 24/7 voice in a channel.',
                        inline: false
                    })
                    .setFooter({
                        text: `Requested by ${message.author.username}`,
                        iconURL: message.author.displayAvatarURL()
                    })
                    .setTimestamp();

                return message.reply({ embeds: [embed] });
            }

            // Build list of 24/7 voice channels
            let channelList = '';
            let activeCount = 0;
            let inactiveCount = 0;

            for (const channelData of voice247Channels) {
                const channel = message.guild.channels.cache.get(channelData.channelId);
                const isConnected = voiceManager.isConnected(message.guild.id);
                const connectionInfo = voiceManager.getConnection(message.guild.id);
                const isThisChannel = connectionInfo && connectionInfo.channelId === channelData.channelId;

                if (channel) {
                    const creator = await message.client.users.fetch(channelData.createdBy).catch(() => null);
                    const createdDate = new Date(channelData.createdAt).toLocaleDateString();
                    const status = isThisChannel && isConnected ? '🟢 Connected' : '🔴 Disconnected';

                    channelList += `\n**${activeCount + inactiveCount + 1}.** ${channel} - ${status}\n`;
                    channelList += `   └ Enabled by: ${creator ? creator.username : 'Unknown'} on ${createdDate}\n`;

                    if (isThisChannel && isConnected) {
                        activeCount++;
                    } else {
                        inactiveCount++;
                    }
                }
            }

            const embed = new EmbedBuilder()
                .setColor('#00ffaa')
                .setTitle('🔊 24/7 Voice Connections')
                .setDescription(channelList || 'No active 24/7 voice channels found.')
                .addFields(
                    {
                        name: '📊 Statistics',
                        value: `**Connected:** ${activeCount}\n**Configured:** ${voice247Channels.length}`,
                        inline: true
                    },
                    {
                        name: '🛠️ Management',
                        value: '**Enable:** `!voice24 #channel`\n**Disable:** `!voicestop #channel`',
                        inline: true
                    }
                )
                .setFooter({
                    text: `Requested by ${message.author.username}`,
                    iconURL: message.author.displayAvatarURL()
                })
                .setTimestamp();

            await message.reply({ embeds: [embed] });

        } catch (error) {
            console.error('VoiceList error:', error);
            await message.reply('❌ An error occurred while fetching voice connections. Please try again.');
        }
    },
};
