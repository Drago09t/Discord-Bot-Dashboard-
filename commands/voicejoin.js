const { EmbedBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const voiceManager = require('../voiceManager');

module.exports = {
    name: 'voicejoin',
    description: 'Manually join a voice channel (temporary, not 24/7)',
    usage: '!voicejoin <channel>',
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
                    return message.reply('❌ Please join a voice channel or specify one! Usage: `!voicejoin #voice-channel`');
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

            // Check if already connected
            if (voiceManager.isConnected(message.guild.id)) {
                return message.reply('⚠️ I\'m already connected to a voice channel in this server! Use `!voiceleave` first.');
            }

            // Join the voice channel (not 24/7)
            await voiceManager.joinChannel(targetChannel, false);

            // Send success message
            const embed = new EmbedBuilder()
                .setColor('#5865F2')
                .setTitle('🔊 Joined Voice Channel')
                .setDescription(`Successfully joined ${targetChannel}`)
                .addFields(
                    {
                        name: 'ℹ️ Connection Type',
                        value: 'Temporary (Manual)',
                        inline: true
                    },
                    {
                        name: '⚠️ Note',
                        value: 'This is NOT a 24/7 connection. Bot may disconnect.',
                        inline: true
                    },
                    {
                        name: '💡 For 24/7 Connection',
                        value: `Use \`!voice24 ${targetChannel.name}\` instead.`,
                        inline: false
                    },
                    {
                        name: '🛠️ Commands',
                        value: '• Leave: `!voiceleave`\n• Enable 24/7: `!voice24`',
                        inline: false
                    }
                )
                .setFooter({
                    text: `Joined by ${message.author.username}`,
                    iconURL: message.author.displayAvatarURL()
                })
                .setTimestamp();

            await message.reply({ embeds: [embed] });

        } catch (error) {
            console.error('VoiceJoin error:', error);
            await message.reply('❌ An error occurred while joining voice. Please try again.');
        }
    },
};
