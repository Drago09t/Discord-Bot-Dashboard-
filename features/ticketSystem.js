
const {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ChannelType,
    PermissionsBitField,
    AttachmentBuilder
} = require('discord.js');
const supabaseDB = require('../supabaseDB');

// Helper to sanitize channel name
const sanitizeChannelName = (name) => name.toLowerCase().replace(/[^a-z0-9-]/g, '-').slice(0, 30);

module.exports = (client) => {

    // Handle Button Interactions
    client.on('interactionCreate', async (interaction) => {
        if (!interaction.isButton()) return;

        const { customId, guild, user, channel } = interaction;
        console.log(`[TicketSystem] Button Clicked: ${customId} by ${user.tag} (${user.id})`);

        // --- Create Ticket ---
        if (customId.startsWith('create_ticket_')) {
            const panelId = customId.replace('create_ticket_', '');
            console.log(`[TicketSystem] Attempting to create ticket for panel: ${panelId}`);

            // Defer immediately to prevent timeout
            await interaction.deferReply({ ephemeral: true });

            try {
                // Check Global Settings
                const settings = await supabaseDB.getTicketSettings(guild.id);
                console.log(`[TicketSystem] Settings for guild ${guild.id}:`, settings);
                if (!settings.enabled) {
                    console.log('[TicketSystem] System disabled.');
                    return interaction.editReply({ content: '❌ The ticket system is currently disabled.' });
                }

                // Check Active Limit
                const activeTickets = await supabaseDB.getActiveTickets(guild.id);
                const userTickets = activeTickets.filter(t => t.user_id === user.id);
                console.log(`[TicketSystem] User has ${userTickets.length} active tickets. Limit: ${settings.limit_per_user}`);
                if (userTickets.length >= (settings.limit_per_user || 1)) {
                    return interaction.editReply({ content: `❌ You have reached the limit of ${settings.limit_per_user} open tickets.` });
                }

                // Get Panel Info
                const panels = await supabaseDB.getTicketPanels(guild.id);
                const panel = panels.find(p => p.id === panelId);
                if (!panel) {
                    console.log(`[TicketSystem] Panel not found: ${panelId}. Available:`, panels.map(p => p.id));
                    return interaction.editReply({ content: '❌ This ticket panel no longer exists.' });
                }

                // Create Channel
                const channelName = panel.naming_scheme
                    .replace('{user}', user.username)
                    .replace('{id}', user.id.slice(-4));

                const sanitizedName = sanitizeChannelName(channelName);

                const permissionOverwrites = [
                    {
                        id: guild.id, // @everyone
                        deny: [PermissionsBitField.Flags.ViewChannel],
                    },
                    {
                        id: user.id,
                        allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.AttachFiles],
                    },
                    {
                        id: client.user.id,
                        allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.ManageChannels],
                    }
                ];

                // Add Support Role
                if (panel.support_role_id) {
                    permissionOverwrites.push({
                        id: panel.support_role_id,
                        allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
                    });
                }

                const ticketChannel = await guild.channels.create({
                    name: sanitizedName,
                    type: ChannelType.GuildText,
                    parent: panel.category_id || settings.category_id,
                    permissionOverwrites
                });

                // Save to DB
                await supabaseDB.createTicket({
                    guild_id: guild.id,
                    channel_id: ticketChannel.id,
                    user_id: user.id,
                    panel_id: panel.id,
                    status: 'open'
                });

                // Send Welcome Embed
                const welcomeEmbed = new EmbedBuilder()
                    .setTitle(`Ticket: ${panel.title}`)
                    .setDescription(panel.welcome_message.replace('{user}', `<@${user.id}>`))
                    .setColor(0x5865F2)
                    .addFields(
                        { name: 'User', value: `<@${user.id}>`, inline: true },
                        { name: 'Panel', value: panel.title, inline: true }
                    );

                const controlsRow = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId('close_ticket')
                        .setLabel('Close Ticket')
                        .setStyle(ButtonStyle.Danger)
                        .setEmoji('🔒'),
                    new ButtonBuilder()
                        .setCustomId('claim_ticket')
                        .setLabel('Claim')
                        .setStyle(ButtonStyle.Success)
                        .setEmoji('🙋‍♂️')
                );

                await ticketChannel.send({
                    content: `${user} ${panel.support_role_id ? `<@&${panel.support_role_id}>` : ''}`,
                    embeds: [welcomeEmbed],
                    components: [controlsRow]
                });

                await interaction.editReply({ content: `✅ Ticket created: ${ticketChannel}` });

            } catch (error) {
                console.error('Error creating ticket:', error);
                if (interaction.deferred) {
                    interaction.editReply({ content: '❌ Failed to create ticket. Check permissions.' });
                } else {
                    interaction.reply({ content: '❌ Failed to create ticket.', ephemeral: true });
                }
            }
        }

        // --- Close Ticket ---
        if (customId === 'close_ticket') {
            await interaction.deferReply();

            try {
                // Generate Transcript
                const messages = await channel.messages.fetch({ limit: 100 });
                const transcriptContent = messages
                    .reverse()
                    .map(m => `[${m.createdAt.toLocaleString()}] ${m.author.tag}: ${m.content} ${m.attachments.size > 0 ? '[Attachment]' : ''}`)
                    .join('\n');

                const buffer = Buffer.from(transcriptContent, 'utf-8');
                const attachment = new AttachmentBuilder(buffer, { name: `transcript-${channel.name}.txt` });

                // 1. Send to Log Channel
                const settings = await supabaseDB.getTicketSettings(guild.id);
                if (settings.transcript_channel_id) {
                    const logChannel = guild.channels.cache.get(settings.transcript_channel_id);
                    if (logChannel) {
                        const logEmbed = new EmbedBuilder()
                            .setTitle('Ticket Closed')
                            .addFields(
                                { name: 'Ticket', value: channel.name, inline: true },
                                { name: 'Closed By', value: user.tag, inline: true }
                            )
                            .setColor(0xFFA500)
                            .setTimestamp();

                        try {
                            await logChannel.send({ embeds: [logEmbed], files: [attachment] });
                        } catch (err) {
                            console.error('Failed to send transcript to log channel:', err);
                        }
                    }
                }

                // 2. Send DM to User (Ticket Creator)
                // We need to find the user who created the ticket. 
                // We can query the active_tickets table for this channel.
                const activeTickets = await supabaseDB.getActiveTickets(guild.id);
                const ticketData = activeTickets.find(t => t.channel_id === channel.id);

                if (ticketData) {
                    try {
                        const ticketOwner = await guild.members.fetch(ticketData.user_id).catch(() => null);
                        if (ticketOwner) {
                            const dmEmbed = new EmbedBuilder()
                                .setTitle('Ticket Closed')
                                .setDescription(`Your ticket **${channel.name}** in **${guild.name}** has been closed. A transcript is attached.`)
                                .setColor(0x5865F2)
                                .setTimestamp();

                            await ticketOwner.send({ embeds: [dmEmbed], files: [attachment] });
                            console.log(`Sent transcript DM to ${ticketOwner.user.tag}`);
                        }
                    } catch (err) {
                        console.error(`Failed to send DM to ticket owner (${ticketData.user_id}):`, err);
                        // Optional: Notify in the channel that DM failed
                        await channel.send(`⚠️ Could not DM transcript to the user (DMs closed or user left).`);
                    }
                }

                // Remove from DB and Delete Channel
                await supabaseDB.closeTicket(channel.id);
                await channel.send('🔒 Ticket closing in 5 seconds...');

                setTimeout(() => channel.delete().catch(() => { }), 5000);

            } catch (error) {
                console.error('Error closing ticket:', error);
                interaction.editReply('❌ Failed to close ticket.');
            }
        }

        // --- Claim Ticket ---
        if (customId === 'claim_ticket') {
            await interaction.reply({ content: `🙋‍♂️ Ticket claimed by ${user}`, embeds: [] });
            // Could update DB or add specific perms here if needed
        }
    });

    console.log('[Feature] Ticket System Loaded');
};
