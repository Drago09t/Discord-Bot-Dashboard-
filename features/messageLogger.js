const { EmbedBuilder } = require('discord.js');
const supabaseDB = require('../supabaseDB');

async function handleMessageDelete(message) {
    if (!message.guild || message.author?.bot) return;

    const settings = await supabaseDB.getGuildSettings(message.guild.id);
    if (!settings || !settings.logging_enabled) return;

    const logChannel = message.guild.channels.cache.get(settings.logging_channel_id);
    if (!logChannel) return;

    const embed = {
        color: 0xff4444,
        title: '🗑️ Message Deleted',
        fields: [
            { name: 'Author', value: `${message.author} (${message.author.tag})`, inline: true },
            { name: 'Channel', value: `${message.channel}`, inline: true },
            { name: 'Content', value: message.content || '*[No text content]*' }
        ],
        timestamp: new Date().toISOString(),
        footer: { text: `User ID: ${message.author.id}` }
    };

    if (message.content && message.content.length > 1024) {
        embed.fields[2].value = message.content.substring(0, 1021) + '...';
    }

    await logChannel.send({ embeds: [embed] }).catch(console.error);
}

async function handleMessageUpdate(oldMessage, newMessage) {
    if (!oldMessage.guild || oldMessage.author?.bot) return;
    if (oldMessage.content === newMessage.content) return;

    const settings = await supabaseDB.getGuildSettings(oldMessage.guild.id);
    if (!settings || !settings.logging_enabled) return;

    const logChannel = oldMessage.guild.channels.cache.get(settings.logging_channel_id);
    if (!logChannel) return;

    const embed = {
        color: 0x4444ff,
        title: '📝 Message Edited',
        fields: [
            { name: 'Author', value: `${oldMessage.author} (${oldMessage.author.tag})`, inline: true },
            { name: 'Channel', value: `${oldMessage.channel}`, inline: true },
            { name: 'Before', value: oldMessage.content || '*[No text content]*' },
            { name: 'After', value: newMessage.content || '*[No text content]*' }
        ],
        timestamp: new Date().toISOString(),
        footer: { text: `User ID: ${oldMessage.author.id}` }
    };

    if (embed.fields[2].value.length > 1024) embed.fields[2].value = embed.fields[2].value.substring(0, 1021) + '...';
    if (embed.fields[3].value.length > 1024) embed.fields[3].value = embed.fields[3].value.substring(0, 1021) + '...';

    await logChannel.send({ embeds: [embed] }).catch(console.error);
}

module.exports = { handleMessageDelete, handleMessageUpdate };
