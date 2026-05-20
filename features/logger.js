const { EmbedBuilder, AuditLogEvent } = require('discord.js');
const supabaseDB = require('../supabaseDB');

/**
 * Validates if a specific event should be logged and returns the target channel and config.
 * @param {Guild} guild - The Discord Guild object.
 * @param {string} eventType - The unique identifier for the event (e.g., 'message_delete').
 * @returns {Promise<{channel: Channel, config: Object}|null>}
 */
async function getLogConfig(guild, eventType) {
    if (!guild) return null;

    // 1. Fetch all settings for this guild to minimize DB calls (cached in practice, or fetched once)
    // Note: optimization - in production we might cache this. For now, we fetch distinct settings.
    const allSettings = await supabaseDB.getLogSettings(guild.id);

    // 2. Find specific config for this event
    const config = allSettings.find(s => s.event_type === eventType);

    // Default: If no config exists, we assume DISABLED for advanced system, or we can set default defaults.
    // Let's assume DISABLED by default until configured to avoid spam.
    if (!config || !config.is_enabled) return null;

    // 3. Check Channel
    if (!config.channel_id) return null;
    const channel = guild.channels.cache.get(config.channel_id);

    if (!channel) return null;

    return { channel, config };
}

async function sendLog(guild, eventType, embedBuilderOrData) {
    try {
        const result = await getLogConfig(guild, eventType);
        if (!result) return;

        const { channel, config } = result;

        // Apply custom color if set, otherwise default to a safe color
        const color = config.embed_color || '#3399FF';

        // If it's an EmbedBuilder, set color. If data, create builder.
        let embed;
        if (embedBuilderOrData instanceof EmbedBuilder) {
            embed = embedBuilderOrData;
        } else {
            embed = new EmbedBuilder(embedBuilderOrData);
        }

        embed.setColor(color);
        // Ensure timestamp is set if not already
        if (!embed.data.timestamp) {
            embed.setTimestamp();
        }

        await channel.send({ embeds: [embed] });
    } catch (error) {
        console.error(`[Logger] Error processing ${eventType} for guild ${guild.id}:`, error.message);
    }
}

const logger = {
    // --- Message Events ---
    messageDelete: async (message) => {
        if (message.author?.bot) return;

        const embed = new EmbedBuilder()
            .setTitle('🗑️ Message Deleted')
            .setDescription(`**Author:** ${message.author} (${message.author.tag})\n**Channel:** ${message.channel}\n**Content:**\n${message.content || '*[Attachment/Embed]*'}`)
            .setFooter({ text: `User ID: ${message.author.id} | Message ID: ${message.id}` });

        if (message.attachments.size > 0) {
            embed.addFields({ name: 'Attachments', value: `${message.attachments.size} files` });
        }

        await sendLog(message.guild, 'message_delete', embed);
    },

    messageUpdate: async (oldMessage, newMessage) => {
        if (oldMessage.author?.bot) return;
        if (oldMessage.content === newMessage.content) return;

        const embed = new EmbedBuilder()
            .setTitle('✏️ Message Edited')
            .addFields(
                { name: 'Author', value: `${oldMessage.author} (${oldMessage.author.tag})`, inline: true },
                { name: 'Channel', value: `${oldMessage.channel}`, inline: true },
                { name: 'Before', value: oldMessage.content?.slice(0, 1024) || '*[Empty]*' },
                { name: 'After', value: newMessage.content?.slice(0, 1024) || '*[Empty]*' }
            )
            .setFooter({ text: `User ID: ${oldMessage.author.id}` });

        await sendLog(oldMessage.guild, 'message_update', embed);
    },

    // --- Member Events ---
    memberJoin: async (member) => {
        const embed = new EmbedBuilder()
            .setTitle('👤 Member Joined')
            .setThumbnail(member.user.displayAvatarURL())
            .setDescription(`${member} (${member.user.tag}) joined the server.`)
            .addFields(
                { name: 'Account Created', value: `<t:${Math.floor(member.user.createdTimestamp / 1000)}:R>`, inline: true },
                { name: 'Member Count', value: `${member.guild.memberCount}`, inline: true }
            )
            .setFooter({ text: `User ID: ${member.id}` });

        await sendLog(member.guild, 'member_join', embed);
    },

    memberLeave: async (member) => {
        const embed = new EmbedBuilder()
            .setTitle('👤 Member Left')
            .setThumbnail(member.user.displayAvatarURL())
            .setDescription(`${member} (${member.user.tag}) left the server.`)
            .setFooter({ text: `User ID: ${member.id}` });

        await sendLog(member.guild, 'member_leave', embed);
    },

    memberBanAdd: async (ban) => {
        const embed = new EmbedBuilder()
            .setTitle('🔨 Member Banned')
            .setDescription(`**User:** ${ban.user.tag}`)
            .setFooter({ text: `User ID: ${ban.user.id}` });

        await sendLog(ban.guild, 'member_ban', embed);
    },

    memberBanRemove: async (ban) => {
        const embed = new EmbedBuilder()
            .setTitle('🔓 Member Unbanned')
            .setDescription(`**User:** ${ban.user.tag}`)
            .setFooter({ text: `User ID: ${ban.user.id}` });

        await sendLog(ban.guild, 'member_unban', embed);
    },

    memberKick: async (member) => {
        // Discord API doesn't have a direct 'kick' event. We often infer it from Audit Logs.
        // For simplicity in this iteration, we treat it distinct if we can detect it, otherwise it's just a leave.
        // Assuming we hook this up to an audit log checker in the future.
    },

    memberUpdate: async (oldMember, newMember) => {
        // Nickname changes
        if (oldMember.nickname !== newMember.nickname) {
            const embed = new EmbedBuilder()
                .setTitle('🏷️ Nickname Changed')
                .setDescription(`**User:** ${newMember.user.tag}`)
                .addFields(
                    { name: 'Old Nickname', value: oldMember.nickname || '*[None]*', inline: true },
                    { name: 'New Nickname', value: newMember.nickname || '*[None]*', inline: true }
                )
                .setFooter({ text: `User ID: ${newMember.id}` });
            await sendLog(newMember.guild, 'member_nickname', embed);
        }

        // Role changes
        const oldRoles = oldMember.roles.cache;
        const newRoles = newMember.roles.cache;

        // Roles added
        const addedRoles = newRoles.filter(role => !oldRoles.has(role.id));
        if (addedRoles.size > 0) {
            addedRoles.forEach(async role => {
                const embed = new EmbedBuilder()
                    .setTitle('➕ Role Given')
                    .setDescription(`**User:** ${newMember.user.tag}`)
                    .addFields({ name: 'Role Added', value: role.name })
                    .setFooter({ text: `User ID: ${newMember.id}` });
                await sendLog(newMember.guild, 'role_give', embed);
            });
        }

        // Roles removed
        const removedRoles = oldRoles.filter(role => !newRoles.has(role.id));
        if (removedRoles.size > 0) {
            removedRoles.forEach(async role => {
                const embed = new EmbedBuilder()
                    .setTitle('➖ Role Removed')
                    .setDescription(`**User:** ${newMember.user.tag}`)
                    .addFields({ name: 'Role Removed', value: role.name })
                    .setFooter({ text: `User ID: ${newMember.id}` });
                await sendLog(newMember.guild, 'role_remove', embed);
            });
        }
    },

    // --- Channel Events ---
    channelCreate: async (channel) => {
        const embed = new EmbedBuilder()
            .setTitle('📁 Channel Created')
            .addFields(
                { name: 'Name', value: `#${channel.name}`, inline: true },
                { name: 'Type', value: `${channel.type}`, inline: true }
            )
            .setFooter({ text: `Channel ID: ${channel.id}` });

        await sendLog(channel.guild, 'channel_create', embed);
    },

    channelDelete: async (channel) => {
        const embed = new EmbedBuilder()
            .setTitle('📁 Channel Deleted')
            .addFields({ name: 'Name', value: `#${channel.name}` })
            .setFooter({ text: `Channel ID: ${channel.id}` });

        await sendLog(channel.guild, 'channel_delete', embed);
    },

    channelUpdate: async (oldChannel, newChannel) => {
        if (oldChannel.name !== newChannel.name) {
            const embed = new EmbedBuilder()
                .setTitle('📝 Channel Renamed')
                .addFields(
                    { name: 'Old Name', value: `#${oldChannel.name}`, inline: true },
                    { name: 'New Name', value: `#${newChannel.name}`, inline: true }
                )
                .setFooter({ text: `Channel ID: ${newChannel.id}` });
            await sendLog(newChannel.guild, 'channel_update', embed);
        }
    },

    // --- Role Events ---
    roleCreate: async (role) => {
        const embed = new EmbedBuilder()
            .setTitle('🛡️ Role Created')
            .setDescription(`**Name:** ${role.name}`)
            .setFooter({ text: `Role ID: ${role.id}` });

        await sendLog(role.guild, 'role_create', embed);
    },

    roleDelete: async (role) => {
        const embed = new EmbedBuilder()
            .setTitle('🗑️ Role Deleted')
            .setDescription(`**Name:** ${role.name}`)
            .setFooter({ text: `Role ID: ${role.id}` });

        await sendLog(role.guild, 'role_delete', embed);
    },

    roleUpdate: async (oldRole, newRole) => {
        if (oldRole.name !== newRole.name) {
            const embed = new EmbedBuilder()
                .setTitle('🛡️ Role Updated')
                .addFields(
                    { name: 'Old Name', value: oldRole.name, inline: true },
                    { name: 'New Name', value: newRole.name, inline: true }
                )
                .setFooter({ text: `Role ID: ${newRole.id}` });
            await sendLog(newRole.guild, 'role_update', embed);
        }
    },

    // --- Voice Events ---
    voiceStateUpdate: async (oldState, newState) => {
        const member = newState.member;

        // Join
        if (!oldState.channelId && newState.channelId) {
            const embed = new EmbedBuilder()
                .setTitle('🔊 Member Joined Voice')
                .setDescription(`**User:** ${member.user.tag}\n**Channel:** ${newState.channel.name}`);
            await sendLog(member.guild, 'voice_join', embed);
        }
        // Leave
        else if (oldState.channelId && !newState.channelId) {
            const embed = new EmbedBuilder()
                .setTitle('🔇 Member Left Voice')
                .setDescription(`**User:** ${member.user.tag}\n**Channel:** ${oldState.channel.name}`);
            await sendLog(member.guild, 'voice_leave', embed);
        }
        // Move
        else if (oldState.channelId && newState.channelId && oldState.channelId !== newState.channelId) {
            const embed = new EmbedBuilder()
                .setTitle('↔️ Member Switched Voice')
                .setDescription(`**User:** ${member.user.tag}\n**From:** ${oldState.channel.name}\n**To:** ${newState.channel.name}`);
            await sendLog(member.guild, 'voice_move', embed);
        }
        // State Change (Mute/Deafen)
        else if (oldState.serverMute !== newState.serverMute || oldState.serverDeaf !== newState.serverDeaf) {
            const embed = new EmbedBuilder()
                .setTitle('🎙️ Voice State Changed')
                .setDescription(`**User:** ${member.user.tag}\n**Muted:** ${newState.serverMute ? 'Yes' : 'No'}\n**Deafened:** ${newState.serverDeaf ? 'Yes' : 'No'}`);
            await sendLog(member.guild, 'voice_state', embed);
        }
    },

    // --- Server Events ---
    guildUpdate: async (oldGuild, newGuild) => {
        if (oldGuild.name !== newGuild.name) {
            const embed = new EmbedBuilder()
                .setTitle('🏠 Server Updated')
                .addFields(
                    { name: 'Old Name', value: oldGuild.name, inline: true },
                    { name: 'New Name', value: newGuild.name, inline: true }
                );
            await sendLog(newGuild, 'update_server', embed);
        }
    },

    inviteCreate: async (invite) => {
        const embed = new EmbedBuilder()
            .setTitle('📨 Invite Created')
            .setDescription(`**Code:** ${invite.code}\n**Creator:** ${invite.inviter?.tag}\n**Channel:** ${invite.channel?.name}`);
        await sendLog(invite.guild, 'servers_invites', embed);
    }
};

module.exports = logger;
