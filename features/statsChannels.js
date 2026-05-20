const { GatewayIntentBits } = require('discord.js');

async function updateStatsChannels(client) {
    for (const guild of client.guilds.cache.values()) {
        const stats = await getGuildStats(guild);
        // This is a simplified version - in a real bot we'd store which channels are which in a DB
        // For now, let's look for channels starting with specific emojis

        const memberCountChannel = guild.channels.cache.find(c => c.name.startsWith('👥 Members:'));
        const botCountChannel = guild.channels.cache.find(c => c.name.startsWith('🤖 Bots:'));
        const onlineCountChannel = guild.channels.cache.find(c => c.name.startsWith('🟢 Online:'));

        if (memberCountChannel) await memberCountChannel.setName(`👥 Members: ${stats.members}`).catch(() => { });
        if (botCountChannel) await botCountChannel.setName(`🤖 Bots: ${stats.bots}`).catch(() => { });
        if (onlineCountChannel) await onlineCountChannel.setName(`🟢 Online: ${stats.online}`).catch(() => { });
    }
}

async function getGuildStats(guild) {
    try {
        const members = await guild.members.fetch();
        return {
            members: guild.memberCount,
            bots: members.filter(m => m.user.bot).size,
            online: members.filter(m => m.presence?.status === 'online').size
        };
    } catch (error) {
        return {
            members: guild.memberCount,
            bots: 0,
            online: 0
        };
    }
}

module.exports = { updateStatsChannels };
