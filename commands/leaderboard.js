const { EmbedBuilder } = require('discord.js');
const rankingDB = require('../rankingDB');

module.exports = {
    name: 'leaderboard',
    description: 'View the server leaderboard',
    usage: '!leaderboard',
    execute: async (message, args) => {
        if (!message.guild) {
            return message.reply('❌ This command can only be used in a server!');
        }

        try {
            await message.channel.sendTyping();

            const leaderboard = await rankingDB.getLeaderboard(message.guild.id, 10);

            if (leaderboard.length === 0) {
                return message.reply('📊 No ranking data yet! Start chatting to earn XP!');
            }

            // Build leaderboard text
            let leaderboardText = '';
            const medals = ['🥇', '🥈', '🥉'];

            for (let i = 0; i < leaderboard.length; i++) {
                const userData = leaderboard[i];
                const medal = i < 3 ? medals[i] : `**${i + 1}.**`;
                const user = await message.client.users.fetch(userData.userId).catch(() => null);
                const username = user ? user.username : userData.username;

                leaderboardText += `${medal} **${username}**\n`;
                leaderboardText += `   └ Level ${userData.level} • ${userData.xp.toLocaleString()} XP • ${userData.totalMessages} messages\n\n`;
            }

            const embed = new EmbedBuilder()
                .setColor('#FFD700')
                .setTitle(`${leaderboard.length > 1 ? '🏆' : '⭐'} ${message.guild.name} Leaderboard`)
                .setDescription(leaderboardText)
                .setFooter({
                    text: `Requested by ${message.author.username} • Top ${leaderboard.length} users`,
                    iconURL: message.author.displayAvatarURL()
                })
                .setTimestamp();

            if (message.guild.iconURL()) {
                embed.setThumbnail(message.guild.iconURL({ dynamic: true, size: 256 }));
            }

            await message.reply({ embeds: [embed] });

        } catch (error) {
            console.error('Leaderboard error:', error);
            await message.reply('❌ Failed to fetch leaderboard. Please try again.');
        }
    },
};
