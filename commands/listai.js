const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const channelDB = require('../channelDB');

module.exports = {
    name: 'listai',
    description: 'List all AI channels in this server',
    usage: '!listai',
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
            // Get all AI channels for this guild
            const aiChannels = await channelDB.getChannelsByGuild(message.guild.id);

            if (aiChannels.length === 0) {
                const embed = new EmbedBuilder()
                    .setColor('#FFA500')
                    .setTitle('📋 AI Channels')
                    .setDescription('No AI channels have been set up in this server yet.')
                    .addFields({
                        name: '💡 How to Set Up',
                        value: 'Use `!setup` or `!setup #channel` to create an AI channel.',
                        inline: false
                    })
                    .setFooter({
                        text: `Requested by ${message.author.username}`,
                        iconURL: message.author.displayAvatarURL()
                    })
                    .setTimestamp();

                return message.reply({ embeds: [embed] });
            }

            // Build list of AI channels
            let channelList = '';
            let activeCount = 0;
            let deletedCount = 0;

            for (const channelData of aiChannels) {
                const channel = message.guild.channels.cache.get(channelData.channelId);

                if (channel) {
                    const creator = await message.client.users.fetch(channelData.createdBy).catch(() => null);
                    const createdDate = new Date(channelData.createdAt).toLocaleDateString();

                    channelList += `\n**${activeCount + 1}.** ${channel}\n`;
                    channelList += `   └ Created by: ${creator ? creator.username : 'Unknown'} on ${createdDate}\n`;
                    activeCount++;
                } else {
                    deletedCount++;
                }
            }

            if (deletedCount > 0) {
                channelList += `\n*${deletedCount} channel(s) were deleted but still in database*`;
            }

            const embed = new EmbedBuilder()
                .setColor('#00ffaa')
                .setTitle('📋 AI Channels in this Server')
                .setDescription(channelList || 'No active AI channels found.')
                .addFields(
                    {
                        name: '📊 Statistics',
                        value: `**Active:** ${activeCount}\n**Total:** ${aiChannels.length}`,
                        inline: true
                    },
                    {
                        name: '🛠️ Management',
                        value: '**Add:** `!setup #channel`\n**Remove:** `!removeai #channel`',
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
            console.error('List AI channels error:', error);
            await message.reply('❌ An error occurred while fetching AI channels. Please try again.');
        }
    },
};
