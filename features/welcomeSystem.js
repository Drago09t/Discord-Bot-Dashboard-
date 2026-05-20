const supabaseDB = require('../supabaseDB');
const welcomeCardGenerator = require('./welcomeCardGenerator');
const { AttachmentBuilder, EmbedBuilder } = require('discord.js');

function formatMessage(message, member) {
    return message
        .replace(/{user}/g, `<@${member.id}>`)
        .replace(/{user\.tag}/g, member.user.tag)
        .replace(/{user\.username}/g, member.user.username)
        .replace(/{user\.mention}/g, `<@${member.id}>`)
        .replace(/{server}/g, member.guild.name)
        .replace(/{guild\.name}/g, member.guild.name)
        .replace(/{membercount}/g, member.guild.memberCount)
        .replace(/{guild\.memberCount}/g, member.guild.memberCount);
}

async function handleMemberJoin(member) {
    console.log(`[WelcomeSystem] Member joined: ${member.user.tag} (${member.id}) in ${member.guild.name}`);
    try {
        const settings = await supabaseDB.getGuildSettings(member.guild.id);
        console.log(`[WelcomeSystem] Settings found: ${!!settings}`);
        if (!settings) return;

        // --- 1. Channel Welcome ---
        console.log(`[WelcomeSystem] Welcome Enabled: ${settings.welcome_enabled}, Channel ID: ${settings.welcome_channel_id}`);
        if (settings.welcome_enabled) {
            const { welcome_channel_id: channelId, welcome_message: message } = settings;
            const channel = member.guild.channels.cache.get(channelId);

            if (channel) {
                const formattedMessage = formatMessage(message, member);

                // Construct Embed
                const embed = new EmbedBuilder()
                    .setTitle(`Welcome to ${member.guild.name}!`)
                    .setDescription(formattedMessage)
                    .setColor(settings.welcome_text_color || '#0099ff')
                    .setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 256 }))
                    .setFooter({ text: `Member #${member.guild.memberCount}` })
                    .setTimestamp();

                const payload = {
                    content: `👋 <@${member.id}>`, // Ping the user outside the embed
                    embeds: [embed]
                };

                // Attach Image Card if enabled
                console.log(`[WelcomeSystem] Welcome Card Enabled: ${settings.welcome_card_enabled}`);
                if (settings.welcome_card_enabled) {
                    try {
                        console.log('[WelcomeSystem] Starting card generation...');
                        const cardBuffer = await welcomeCardGenerator.generate(member, settings);
                        const attachment = new AttachmentBuilder(cardBuffer, { name: 'welcome-card.png' });

                        payload.files = [attachment];
                        embed.setImage('attachment://welcome-card.png'); // Link embed image to attachment

                        console.log('[WelcomeSystem] Card generation successful.');
                    } catch (error) {
                        console.error('[WelcomeSystem] Failed to generate welcome card:', error);
                    }
                }

                await channel.send(payload);

                console.log(`[WelcomeSystem] Welcome message sent to #${channel.name}`);
            } else {
                console.warn(`[WelcomeSystem] Channel not found in cache: ${channelId}`);
            }
        }

        // --- 2. DM Welcome ---
        console.log(`[WelcomeSystem] DM Welcome Enabled: ${settings.welcome_dm_enabled}`);
        if (settings.welcome_dm_enabled) {
            try {
                const dmMessage = settings.welcome_dm_message || 'Welcome to {server}, {user}!';
                const formattedDM = formatMessage(dmMessage, member);
                await member.send(formattedDM);
                console.log(`[WelcomeSystem] DM sent to ${member.user.tag}`);
            } catch (error) {
                console.error(`[WelcomeSystem] Error sending welcome DM to ${member.user.tag}:`, error.message);
            }
        }
    } catch (error) {
        console.error('[WelcomeSystem] Critical Error in handleMemberJoin:', error);
    }
}



async function handleMemberLeave(member) {
    const settings = await supabaseDB.getGuildSettings(member.guild.id);
    if (!settings || !settings.goodbye_enabled) return;

    const { goodbye_channel_id: channelId, goodbye_message: message } = settings;
    const channel = member.guild.channels.cache.get(channelId);
    if (!channel) return;

    const formattedMessage = formatMessage(message, member);
    await channel.send(formattedMessage).catch(console.error);
}


module.exports = { handleMemberJoin, handleMemberLeave };
