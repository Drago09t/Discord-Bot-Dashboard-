const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const voiceManager = require('../voiceManager');

module.exports = {
    name: 'voiceleave',
    description: 'Manually leave current voice channel',
    usage: '!voiceleave',
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
            // Check if bot is connected to voice
            const connectionInfo = voiceManager.getConnection(message.guild.id);

            if (!connectionInfo) {
                return message.reply('❌ I\'m not connected to any voice channel in this server!');
            }

            const channelName = connectionInfo.channelName;
            const is247 = connectionInfo.is247;

            // Leave the voice channel
            voiceManager.leaveChannel(message.guild.id);

            // Send success message
            const embed = new EmbedBuilder()
                .setColor('#ff6b6b')
                .setTitle('👋 Left Voice Channel')
                .setDescription(`Successfully left **${channelName}**`)
                .addFields(
                    {
                        name: '⚠️ Important',
                        value: is247
                            ? '**This was a 24/7 channel!** The bot will attempt to reconnect automatically. To fully disable, use `!voicestop`.'
                            : 'Bot has disconnected from voice.',
                        inline: false
                    },
                    {
                        name: '🛠️ Commands',
                        value: is247
                            ? '• Disable 24/7: `!voicestop`\n• List 24/7: `!voicelist`'
                            : '• Join again: `!voicejoin #voice-channel`',
                        inline: false
                    }
                )
                .setFooter({
                    text: `Left by ${message.author.username}`,
                    iconURL: message.author.displayAvatarURL()
                })
                .setTimestamp();

            await message.reply({ embeds: [embed] });

        } catch (error) {
            console.error('VoiceLeave error:', error);
            await message.reply('❌ An error occurred while leaving voice. Please try again.');
        }
    },
};
