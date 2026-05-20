const { EmbedBuilder } = require('discord.js');
const economyDB = require('../database');

module.exports = {
    name: 'inventory',
    description: 'View your purchased items',
    usage: '!inventory',
    execute: async (message, args, context) => {
        try {
            const inventory = await economyDB.getInventory(message.author.id, message.guild.id);

            if (inventory.length === 0) {
                return message.reply('🎒 Your inventory is empty. Go buy something from the `!shop`!');
            }

            const invEmbed = new EmbedBuilder()
                .setTitle(`🎒 ${message.author.username}'s Inventory`)
                .setDescription('Here are the items you have purchased from the shop.')
                .setColor(0x00aaff)
                .setThumbnail(message.author.displayAvatarURL({ dynamic: true }))
                .setTimestamp();

            const itemFields = inventory.map(entry => {
                const item = entry.item;
                return {
                    name: `${item.icon || '📦'} ${item.name} (x${entry.quantity})`,
                    value: item.description || 'No description',
                    inline: true
                };
            });

            invEmbed.addFields(itemFields);

            await message.reply({ embeds: [invEmbed] });

        } catch (error) {
            console.error('Error in inventory command:', error);
            message.reply('❌ Failed to load your inventory.');
        }
    },
};
