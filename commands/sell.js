const { EmbedBuilder } = require('discord.js');
const economyDB = require('../database');

module.exports = {
    name: 'sell',
    description: 'Sell back an item for 50% of its price',
    usage: '!sell <item name>',
    execute: async (message, args, context) => {
        try {
            if (args.length === 0) {
                return message.reply('❌ Please specify the name of the item you want to sell.');
            }

            const itemName = args.join(' ').toLowerCase();
            const inventory = await economyDB.getInventory(message.author.id, message.guild.id);
            const entry = inventory.find(e => e.item.name.toLowerCase() === itemName);

            if (!entry) {
                return message.reply('❌ You do not have this item in your inventory.');
            }

            const result = await economyDB.sellItem(message.author.id, message.guild.id, entry.item.id);

            const sellEmbed = new EmbedBuilder()
                .setTitle('💰 Item Sold')
                .setDescription(`You have successfully sold your **${result.itemName}** back to the shop.`)
                .addFields(
                    { name: '💵 Refund Amount', value: `${result.refundAmount.toLocaleString()} coins`, inline: true },
                    { name: '🎒 Inventory', value: 'Check your current items with `!inventory`', inline: true }
                )
                .setColor(0xffaa00)
                .setTimestamp();

            await message.reply({ embeds: [sellEmbed] });

        } catch (error) {
            console.error('Error in sell command:', error);
            message.reply(`❌ Sale failed: ${error.message}`);
        }
    },
};
