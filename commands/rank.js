const { AttachmentBuilder } = require('discord.js');
const rankingDB = require('../rankingDB');
const { RankCardGenerator } = require('../rankCardGenerator');

module.exports = {
    name: 'rank',
    description: 'View your or another user\'s rank card',
    usage: '!rank [@user]',
    execute: async (message, args) => {
        if (!message.guild) {
            return message.reply('❌ This command can only be used in a server!');
        }

        let targetUser = message.author;
        if (args.length > 0) {
            const userId = args[0].replace(/[<@!>]/g, '');
            const member = message.guild.members.cache.get(userId);
            if (member) {
                targetUser = member.user;
            }
        }

        try {
            await message.channel.sendTyping();

            // Get user stats
            let userStats = await rankingDB.getUser(targetUser.id, message.guild.id);

            if (!userStats) {
                userStats = await rankingDB.createUser(targetUser.id, message.guild.id, targetUser.username);
            }

            // Get rank
            const rank = await rankingDB.getUserRank(targetUser.id, message.guild.id);

            // Generate rank card
            const cardGenerator = new RankCardGenerator();
            const cardBuffer = await cardGenerator.generateCard(targetUser, userStats, rank, message.guild);

            const attachment = new AttachmentBuilder(cardBuffer, { name: 'rank-card.png' });

            await message.reply({ files: [attachment] });

        } catch (error) {
            console.error('Rank card error:', error);
            await message.reply('❌ Failed to generate rank card. Please try again.');
        }
    },
};
