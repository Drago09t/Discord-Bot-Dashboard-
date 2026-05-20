const { EmbedBuilder } = require('discord.js');
const economyDB = require('../database');

module.exports = {
    name: 'pay',
    description: 'Transfer coins to another user',
    usage: '!pay @user <amount>',
    execute: async (message, args, context) => {
        try {
            const target = message.mentions.users.first();
            const amount = parseInt(args.find(arg => !arg.includes('<@')));

            if (!target) return message.reply('❌ Please mention the user you want to pay.');
            if (!amount || amount <= 0) return message.reply('❌ Please specify a valid amount of coins to pay.');
            if (target.id === message.author.id) return message.reply('❌ You cannot pay yourself!');
            if (target.bot) return message.reply('❌ You cannot pay bots.');

            await economyDB.transferCoins(message.author.id, target.id, message.guild.id, amount);

            const payEmbed = new EmbedBuilder()
                .setTitle('💸 Coins Transferred')
                .setDescription(`You have successfully sent **${amount.toLocaleString()}** coins to **${target.username}**!`)
                .setColor(0x00ff00)
                .setTimestamp();

            await message.reply({ embeds: [payEmbed] });
        } catch (error) {
            console.error('Error in pay command:', error);
            message.reply(`❌ Transfer failed: ${error.message}`);
        }
    },
};
