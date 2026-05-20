const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'userinfo',
    description: 'Display information about a user',
    usage: '!userinfo [@user]',
    execute: async (message, args) => {
        let user;
        let member;

        if (args.length > 0) {
            const userId = args[0].replace(/[<@!>]/g, '');
            member = message.guild?.members.cache.get(userId);
            user = member ? member.user : await message.client.users.fetch(userId).catch(() => null);
        } else {
            user = message.author;
            member = message.member;
        }

        if (!user) {
            return message.reply('❌ User not found!');
        }

        const embed = new EmbedBuilder()
            .setColor(member?.displayHexColor || '#5865F2')
            .setTitle(`👤 ${user.tag}`)
            .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 256 }))
            .addFields(
                { name: '🆔 User ID', value: user.id, inline: true },
                { name: '📅 Account Created', value: `<t:${Math.floor(user.createdTimestamp / 1000)}:R>`, inline: true },
                { name: '🤖 Bot', value: user.bot ? 'Yes' : 'No', inline: true }
            );

        if (member) {
            embed.addFields(
                { name: '📥 Joined Server', value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>`, inline: true },
                { name: '🏷️ Nickname', value: member.nickname || 'None', inline: true },
                { name: '🎭 Roles', value: member.roles.cache.size > 1 ? `${member.roles.cache.size - 1}` : 'None', inline: true }
            );

            const roles = member.roles.cache
                .filter(role => role.id !== message.guild.id)
                .sort((a, b) => b.position - a.position)
                .map(role => role.toString())
                .slice(0, 10);

            if (roles.length > 0) {
                embed.addFields({
                    name: '📜 Top Roles',
                    value: roles.join(' ') + (member.roles.cache.size > 11 ? '...' : ''),
                    inline: false
                });
            }
        }

        embed.setFooter({
            text: `Requested by ${message.author.username}`,
            iconURL: message.author.displayAvatarURL()
        })
            .setTimestamp();

        await message.reply({ embeds: [embed] });
    },
};
