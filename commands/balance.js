const { EmbedBuilder } = require('discord.js');
const economyDB = require('../database');

module.exports = {
    name: 'balance',
    description: 'Check your current coin balance',
    usage: '!balance [@user]',
    execute: async (message, args, context) => {
        try {
            const target = message.mentions.users.first() || message.author;
            const profile = await economyDB.getOrCreateProfile(target.id, message.guild.id);

            const balanceEmbed = new EmbedBuilder()
                .setTitle(`💰 ${target.username}'s Balance`)
                .setDescription(`Current Balance: **${profile.coins.toLocaleString()}** coins`)
                .setColor(0xffd700)
                .setThumbnail(target.displayAvatarURL({ dynamic: true }))
                .setTimestamp();

            await message.reply({ embeds: [balanceEmbed] });
        } catch (error) {
            console.error('Error in balance command:', error);
            message.reply('❌ Failed to fetch balance.');
        }
    },
};
