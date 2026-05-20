const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const economyDB = require('../database');

module.exports = {
    name: 'shop',
    description: 'View the server shop',
    usage: '!shop',
    execute: async (message, args, context) => {
        try {
            console.log(`[Shop] Fetching items for guild ${message.guild.id}...`);
            const items = await economyDB.getShopItems(message.guild.id);
            console.log(`[Shop] Found ${items.length} items.`);

            if (items.length === 0) {
                return message.reply('🛒 The shop is currently empty. Check back later!');
            }

            const shopEmbed = new EmbedBuilder()
                .setTitle(`🛒 ${message.guild.name} Server Shop`)
                .setDescription('Welcome to the shop! Use `!buy <item name>` to purchase an item.')
                .setColor(0xff007f)
                .setThumbnail(message.guild.iconURL({ dynamic: true }) || null)
                .setTimestamp();

            console.log(`[Shop] Building fields for ${items.length} items...`);
            const itemFields = items.map((item, index) => {
                try {
                    const stockText = (item.stock === null || item.stock === undefined || item.stock === -1) ? '∞' : item.stock;
                    const roleText = item.role_id ? ' (Gives Role)' : '';
                    const priceText = item.price !== null && item.price !== undefined ? item.price.toLocaleString() : '0';
                    const icon = item.icon || '📦';

                    return {
                        name: `${icon} ${item.name || 'Unnamed Item'}`,
                        value: `Price: **${priceText}** coins\nStock: **${stockText}**\n${item.description || 'No description'}${roleText}`,
                        inline: true
                    };
                } catch (err) {
                    console.error(`[Shop] Error processing item at index ${index}:`, err, item);
                    return { name: '⚠️ Item Error', value: 'Details missing', inline: true };
                }
            });

            shopEmbed.addFields(itemFields.slice(0, 25)); // Discord limit is 25

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setLabel('View on Dashboard')
                    .setStyle(ButtonStyle.Link)
                    .setURL(`http://localhost:5173/dashboard/shop`)
            );

            console.log(`[Shop] Sending reply...`);
            await message.reply({ embeds: [shopEmbed], components: [row] });
        } catch (error) {
            console.error('CRITICAL Error in shop command:', error);
            message.reply('❌ An internal error occurred while loading the shop. Please check the logs.');
        }
    },
};
