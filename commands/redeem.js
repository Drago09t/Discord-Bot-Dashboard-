const { EmbedBuilder } = require('discord.js');
const adminDB = require('../AdminDB');
const premiumDB = require('../premiumDB');

module.exports = {
    name: 'redeem',
    description: 'Redeem a premium voucher code for this server',
    usage: '!redeem [code]',
    execute: async (message, args) => {
        if (!message.guild) return message.reply('❌ This command can only be used in a server.');

        // Check for Manage Guild permissions
        if (!message.member.permissions.has('ManageGuild') && !await premiumDB.isBotAdmin(message.author.id)) {
            return message.reply('❌ You need the **Manage Server** permission to redeem vouchers.');
        }

        const code = args[0];
        if (!code) return message.reply('❌ Please provide a voucher code. Usage: `!redeem VORTEX-XXXX-YYYY`');

        try {
            const voucher = await adminDB.redeemVoucher(code, message.guild.id);

            // Calculate expiration
            let expiresAt = null;
            if (voucher.duration_days > 0) {
                expiresAt = new Date();
                expiresAt.setDate(expiresAt.getDate() + voucher.duration_days);
            }

            // Update premium settings
            await premiumDB.updatePremiumSettings(message.guild.id, {
                premium_enabled: true,
                premium_tier: voucher.tier,
                unlimited_use: voucher.tier === 2,
                expires_at: expiresAt ? expiresAt.toISOString() : null
            });

            const embed = new EmbedBuilder()
                .setColor('#FFD700')
                .setTitle('✨ Premium Activated!')
                .setDescription(`Congratulations! **${message.guild.name}** is now a Premium server.`)
                .addFields(
                    { name: '💎 Tier', value: voucher.tier === 2 ? 'Ultra Premium' : 'Premium Tier 1', inline: true },
                    { name: '⏳ Duration', value: voucher.duration_days > 0 ? `${voucher.duration_days} Days` : 'Lifetime', inline: true }
                )
                .setThumbnail('https://cdn-icons-png.flaticon.com/512/2550/2550264.png')
                .setFooter({ text: 'Thank you for supporting the bot!' })
                .setTimestamp();

            if (expiresAt) {
                embed.addFields({ name: '📅 Expires On', value: expiresAt.toLocaleDateString(), inline: true });
            }

            await message.reply({ embeds: [embed] });

        } catch (error) {
            console.error('[Redeem] Error:', error.message);
            await message.reply(`❌ **Redemption Failed:** ${error.message}`);
        }
    },
};
