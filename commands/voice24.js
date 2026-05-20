const { EmbedBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const voiceManager = require('../voiceManager');
const voiceDB = require('../voiceDB');

module.exports = {
    name: 'voice24',
    description: 'Enable 24/7 voice connection in a voice channel',
    usage: '!voice24 <channel>',
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
            // Determine which voice channel to join
            let targetChannel;

            if (args.length > 0) {
                // Channel mentioned or ID provided
                const channelId = args[0].replace(/[<#>]/g, '');
                targetChannel = message.guild.channels.cache.get(channelId);

                if (!targetChannel) {
                    return message.reply('❌ Could not find that channel. Please mention a valid voice channel.');
                }
            } else {
                // Check if user is in a voice channel
                if (!message.member.voice.channel) {
                    return message.reply('❌ Please join a voice channel or specify one! Usage: `!voice24 #voice-channel`');
                }
                targetChannel = message.member.voice.channel;
            }

            // Check if it's a voice channel
            if (targetChannel.type !== ChannelType.GuildVoice && targetChannel.type !== ChannelType.GuildStageVoice) {
                return message.reply('❌ The specified channel must be a voice or stage channel.');
            }

            // Check if bot has permissions
            const permissions = targetChannel.permissionsFor(message.guild.members.me);
            if (!permissions.has(PermissionFlagsBits.Connect) || !permissions.has(PermissionFlagsBits.Speak)) {
                return message.reply(`❌ I don't have permission to connect or speak in ${targetChannel}!`);
            }

            // Check if already a 24/7 channel
            const is247 = await voiceDB.is247Channel(targetChannel.id);
            if (is247) {
                return message.reply(`⚠️ ${targetChannel} is already set up as a 24/7 voice channel!`);
            }

            // Add to database
            await voiceDB.add247Channel(
                message.guild.id,
                targetChannel.id,
                targetChannel.name,
                message.author.id
            );

            // Join the voice channel
            await voiceManager.joinChannel(targetChannel, true);

            // Send success message
            const embed = new EmbedBuilder()
                .setColor('#00ff00')
                .setTitle('✅ 24/7 Voice Enabled!')
                .setDescription(`Successfully enabled 24/7 voice connection in ${targetChannel}`)
                .addFields(
                    {
                        name: '🔊 Voice Channel',
                        value: targetChannel.name,
                        inline: true
                    },
                    {
                        name: '🤖 Status',
                        value: 'Connected & Active',
                        inline: true
                    },
                    {
                        name: '🔄 Auto-Reconnect',
                        value: 'Enabled',
                        inline: true
                    },
                    {
                        name: 'ℹ️ What This Means',
                        value: '• Bot will stay connected 24/7\n• Auto-reconnects if disconnected\n• Persists across bot restarts',
                        inline: false
                    },
                    {
                        name: '🛠️ Management',
                        value: `• Stop 24/7: \`!voicestop ${targetChannel.name}\`\n• List all: \`!voicelist\``,
                        inline: false
                    }
                )
                .setFooter({
                    text: `Enabled by ${message.author.username}`,
                    iconURL: message.author.displayAvatarURL()
                })
                .setTimestamp();

            await message.reply({ embeds: [embed] });

        } catch (error) {
            console.error('Voice24 error:', error);
            await message.reply('❌ An error occurred while enabling 24/7 voice. Please try again.');
        }
    },
};
