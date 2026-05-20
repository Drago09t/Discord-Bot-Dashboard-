const { EmbedBuilder } = require('discord.js');
const economyDB = require('../database');

module.exports = {
    name: 'buy',
    description: 'Purchase an item from the shop',
    usage: '!buy <item name>',
    execute: async (message, args, context) => {
        try {
            if (args.length === 0) {
                return message.reply('❌ Please specify the name of the item you want to buy.');
            }

            const itemName = args.join(' ').toLowerCase();
            const items = await economyDB.getShopItems(message.guild.id);
            const item = items.find(i => i.name.toLowerCase() === itemName);

            if (!item) {
                return message.reply(`❌ Item "**${args.join(' ')}**" not found in the shop. Use \`!shop\` to see available items.`);
            }

            // Handle purchase
            const result = await economyDB.buyItem(message.author.id, message.guild.id, item.id);

            // Handle Role Reward
            if (item.role_id) {
                try {
                    const role = message.guild.roles.cache.get(item.role_id);
                    if (role) {
                        await message.member.roles.add(role);
                    }
                } catch (roleErr) {
                    console.error(`Failed to give role ${item.role_id} to ${message.author.tag}:`, roleErr);
                    // Don't fail the whole buy if role fails, just notify
                    await message.channel.send(`⚠️ You bought **${item.name}** but I couldn't give you the role. Please contact an admin.`);
                }
            }

            const successEmbed = new EmbedBuilder()
                .setTitle('🎉 Purchase Successful!')
                .setDescription(`You have successfully purchased **${item.icon || '📦'} ${item.name}**!`)
                .addFields(
                    { name: '💰 Price Paid', value: `${item.price.toLocaleString()} coins`, inline: true },
                    { name: '🎒 Inventory', value: 'Check your items with `!inventory`', inline: true }
                )
                .setColor(0x00ffaa)
                .setThumbnail(item.image_url || null)
                .setTimestamp();

            await message.reply({ embeds: [successEmbed] });

        } catch (error) {
            console.error('Error in buy command:', error);
            message.reply(`❌ Purchase failed: ${error.message}`);
        }
    },
};
