const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    name: 'embed',
    description: 'Create custom embeds (Admin only)',
    usage: '!embed <title> | <description> | [color]',
    execute: async (message, args) => {
        if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return message.reply('❌ You need **Administrator** permissions to use this command.');
        }

        if (args.length === 0) {
            return message.reply('Please provide embed content!\nUsage: `!embed <title> | <description> | [color]`\nExample: `!embed Welcome! | Thanks for joining our server! | #00ff00`');
        }

        const input = args.join(' ');
        const parts = input.split('|').map(p => p.trim());

        if (parts.length < 2) {
            return message.reply('❌ Please provide at least a title and description separated by `|`');
        }

        const title = parts[0];
        const description = parts[1];
        const color = parts[2] || '#5865F2';

        try {
            const embed = new EmbedBuilder()
                .setTitle(title)
                .setDescription(description)
                .setColor(color)
                .setTimestamp();

            await message.channel.send({ embeds: [embed] });
            await message.delete().catch(() => { });

        } catch (error) {
            console.error('Embed error:', error);
            await message.reply('❌ Failed to create embed. Check your color format (e.g., #00ff00)');
        }
    },
};
