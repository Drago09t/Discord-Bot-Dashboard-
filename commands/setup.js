const { EmbedBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const channelDB = require('../channelDB');

module.exports = {
    name: 'setup',
    description: 'Setup an AI channel for automated AI conversations',
    usage: '!setup [channel]',
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
            // Determine which channel to set up
            let targetChannel;

            if (args.length > 0) {
                // Channel mentioned or ID provided
                const channelId = args[0].replace(/[<#>]/g, '');
                targetChannel = message.guild.channels.cache.get(channelId);

                if (!targetChannel) {
                    return message.reply('❌ Could not find that channel. Please mention a valid channel or use this command in the channel you want to set up.');
                }
            } else {
                // Use current channel
                targetChannel = message.channel;
            }

            // Check if it's a text channel
            if (targetChannel.type !== ChannelType.GuildText) {
                return message.reply('❌ AI channels must be text channels.');
            }

            // Check if already an AI channel
            const isAlreadyAI = await channelDB.isAIChannel(targetChannel.id);
            if (isAlreadyAI) {
                return message.reply(`⚠️ ${targetChannel} is already set up as an AI channel!`);
            }

            // Add channel to database
            await channelDB.addChannel(
                message.guild.id,
                targetChannel.id,
                targetChannel.name,
                message.author.id
            );

            // Send success message
            const embed = new EmbedBuilder()
                .setColor('#00ff00')
                .setTitle('✅ AI Channel Setup Complete!')
                .setDescription(`${targetChannel} has been configured as an AI channel.`)
                .addFields(
                    {
                        name: '💬 How It Works',
                        value: 'All messages in this channel will automatically get AI responses - no need to mention the bot!',
                        inline: false
                    },
                    {
                        name: '🎯 What You Can Do',
                        value: '• Ask questions naturally\n• Have conversations with context\n• Use all bot commands\n• Use slash commands',
                        inline: false
                    },
                    {
                        name: '🛠️ Management',
                        value: `• Remove AI: \`!removeai #${targetChannel.name}\`\n• List AI channels: \`!listai\``,
                        inline: false
                    }
                )
                .setFooter({
                    text: `Set up by ${message.author.username}`,
                    iconURL: message.author.displayAvatarURL()
                })
                .setTimestamp();

            await message.reply({ embeds: [embed] });

            // Send a welcome message in the AI channel
            if (targetChannel.id !== message.channel.id) {
                const welcomeEmbed = new EmbedBuilder()
                    .setColor('#00ffaa')
                    .setTitle('🤖 AI Channel Activated!')
                    .setDescription('This channel is now an **AI-enabled channel**. All your messages will receive AI-powered responses!')
                    .addFields(
                        {
                            name: '✨ Features',
                            value: '• Natural conversation flow\n• Context-aware responses\n• Multi-language support\n• Advanced formatting',
                            inline: true
                        },
                        {
                            name: '💡 Tips',
                            value: '• Just type naturally\n• Use commands with `!` or `/`\n• Conversations have memory\n• Use `!clear` to reset',
                            inline: true
                        }
                    )
                    .setFooter({
                        text: 'Powered by Google Gemini AI',
                        iconURL: message.client.user.displayAvatarURL()
                    })
                    .setTimestamp();

                await targetChannel.send({ embeds: [welcomeEmbed] });
            }

        } catch (error) {
            console.error('Setup error:', error);
            await message.reply('❌ An error occurred while setting up the AI channel. Please try again.');
        }
    },
};
