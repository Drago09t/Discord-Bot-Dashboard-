const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'avatar',
    description: 'Get the avatar of a user or server icon',
    usage: '!avatar [@user]',
    execute: async (message, args) => {
        let avatarURL;
        let title;
        let color = '#5865F2';

        if (args.length > 0 && args[0].toLowerCase() === 'server') {
            if (!message.guild) {
                return message.reply('❌ This command can only be used in a server!');
            }
            avatarURL = message.guild.iconURL({ dynamic: true, size: 1024 });
            title = `${message.guild.name} Server Icon`;
        } else {
            let user;
            if (args.length > 0) {
                const userId = args[0].replace(/[<@!>]/g, '');
                user = await message.client.users.fetch(userId).catch(() => null);
            } else {
                user = message.author;
            }

            if (!user) {
                return message.reply('❌ User not found!');
            }

            avatarURL = user.displayAvatarURL({ dynamic: true, size: 1024 });
            title = `${user.tag}'s Avatar`;

            if (message.guild) {
                const member = message.guild.members.cache.get(user.id);
                if (member) color = member.displayHexColor;
            }
        }

        if (!avatarURL) {
            return message.reply('❌ No avatar/icon found!');
        }

        const embed = new EmbedBuilder()
            .setColor(color)
            .setTitle(title)
            .setImage(avatarURL)
            .setDescription(`[Download Link](${avatarURL})`)
            .setFooter({
                text: `Requested by ${message.author.username}`,
                iconURL: message.author.displayAvatarURL()
            })
            .setTimestamp();

        await message.reply({ embeds: [embed] });
    },
};
