const { Events, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const database = require('../database');

module.exports = (client) => {
    console.log('[GiveawaySystem] Module loaded and listener registered.');

    client.on(Events.InteractionCreate, async (interaction) => {
        // Debug Log for ANY button
        if (interaction.isButton()) {
            console.log(`[GiveawaySystem] Button Click Detected: ${interaction.customId}`);
        }

        if (!interaction.isButton()) return;
        if (!interaction.customId.startsWith('join_giveaway_')) return;

        console.log(`[GiveawaySystem] Processing join request...`);

        try {
            await interaction.deferReply({ ephemeral: true });
        } catch (deferError) {
            console.error('[GiveawaySystem] Failed to defer reply:', deferError);
            return; // Can't do anything if defer fails
        }

        const giveawayId = interaction.customId.replace('join_giveaway_', '');
        const guildId = interaction.guildId;
        const userId = interaction.user.id;

        console.log(`[GiveawaySystem] parsed ID: ${giveawayId}, Guild: ${guildId}, User: ${userId}`);

        try {
            // 1. Fetch Giveaway Data
            console.log(`[Giveaway] Fetching active giveaways for guild ${guildId}`);
            const activeGiveaways = await database.getActiveGiveaways(guildId);
            const giveaway = activeGiveaways.find(g => g.id.toString() === giveawayId);

            if (!giveaway) {
                console.log(`[Giveaway] Giveaway ${giveawayId} not found in active list.`);
                return interaction.editReply({ content: '❌ This giveaway has ended or does not exist.' });
            }

            if (giveaway.status !== 'active') {
                console.log(`[Giveaway] Giveaway ${giveawayId} is not active.`);
                return interaction.editReply({ content: '❌ This giveaway has ended.' });
            }

            console.log(`[Giveaway] Requirements check for ${userId}...`);
            // 2. Check Requirements

            // Level Check (DB)
            const levelCheck = await database.checkGiveawayRequirements(userId, guildId, giveaway.requirements);
            if (!levelCheck) {
                console.log(`[Giveaway] Level check failed for ${userId}`);
                return interaction.editReply({ content: `❌ You do not meet the level requirement (Lvl ${giveaway.requirements.min_level}+). Check your rank with /rank.` });
            }

            // Role Check (Discord)
            if (giveaway.requirements?.required_role_id) {
                try {
                    const member = await interaction.guild.members.fetch(userId);
                    if (!member.roles.cache.has(giveaway.requirements.required_role_id)) {
                        console.log(`[Giveaway] Role check failed for ${userId}`);
                        return interaction.editReply({ content: `❌ You need the <@&${giveaway.requirements.required_role_id}> role to enter this giveaway.` });
                    }
                } catch (err) {
                    console.error(`[Giveaway] Failed to fetch member for role check:`, err);
                    // If we can't fetch member, maybe let them in or fail? Let's fail safe.
                    return interaction.editReply({ content: '❌ Could not verify your roles. Please try again.' });
                }
            }

            // 3. Enter Giveaway
            try {
                console.log(`[Giveaway] Entering user ${userId} into ${giveawayId}`);
                await database.enterGiveaway(giveawayId, userId);

                // Update Embed User Count (Optional but nice)
                // We'll increment locally to show quick feedback, but ideally we'd fetch count
                // For now just reply success
                interaction.editReply({ content: '🎉 **Success!** You have entered the giveaway. Good luck!' });

            } catch (error) {
                if (error.code === '23505' || error.message.includes('unique constraint')) { // Unique violation
                    console.log(`[Giveaway] User ${userId} already entered.`);
                    return interaction.editReply({ content: '⚠️ You have already entered this giveaway!' });
                }
                throw error;
            }

        } catch (error) {
            console.error('[Giveaway] Error handling join:', error);
            interaction.editReply({ content: '❌ An error occurred while processing your entry.' });
        }
    });
};

// Helper to post the giveaway embed
module.exports.postGiveaway = async (client, guildId, channelId, giveawayData) => {
    try {
        const guild = await client.guilds.fetch(guildId);
        const channel = await guild.channels.fetch(channelId);

        const endTime = new Date(giveawayData.end_time);
        const timestamp = Math.floor(endTime.getTime() / 1000);

        const embed = new EmbedBuilder()
            .setTitle('🎉  ' + giveawayData.title)
            .setDescription(giveawayData.description || `React to win **${giveawayData.prize}**!`)
            .setColor('#FF0080')
            .addFields(
                { name: '🏆 Prize', value: `**${giveawayData.prize}**`, inline: true },
                { name: '👥 Winners', value: `${giveawayData.winners_count}`, inline: true },
                { name: '📅 Ends', value: `<t:${timestamp}:R> (<t:${timestamp}:F>)`, inline: false }
            )
            .setTimestamp(endTime)
            .setFooter({ text: 'Hosted by ' + giveawayData.created_by });

        if (giveawayData.requirements) {
            let reqText = '';
            if (giveawayData.requirements.min_level) reqText += `• Level ${giveawayData.requirements.min_level}+\n`;
            if (giveawayData.requirements.required_role_id) reqText += `• Role: <@&${giveawayData.requirements.required_role_id}>\n`;

            if (reqText) embed.addFields({ name: '📋 Requirements', value: reqText });
        }

        const btn = new ButtonBuilder()
            .setCustomId(`join_giveaway_${giveawayData.id}`) // We need ID here... wait, we need to create DB first to get ID. API handles this order.
            // Actually, the API creates DB record -> gets ID -> calls this function -> posts message -> updates DB with messageID.
            // So we DO have the ID in giveawayData if we pass it correctly.
            .setLabel('🎉 Join Giveaway')
            .setStyle(ButtonStyle.Success);

        const row = new ActionRowBuilder().addComponents(btn);

        const message = await channel.send({ embeds: [embed], components: [row] });
        return message;

    } catch (error) {
        console.error('[Giveaway] Failed to post message:', error);
        throw error;
    }
};
