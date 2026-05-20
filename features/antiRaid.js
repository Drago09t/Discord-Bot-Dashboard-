const supabaseDB = require('../supabaseDB');

const joinCache = new Map();

async function handleAntiRaid(member) {
    try {
        const settings = await supabaseDB.getGuildSettings(member.guild.id);
        if (!settings || !settings.raid_protection_enabled) return;

        const now = Date.now();
        const guildJoins = joinCache.get(member.guild.id) || [];
        guildJoins.push(now);

        const recentJoins = guildJoins.filter(time => now - time < (settings.raid_window_seconds * 1000));
        joinCache.set(member.guild.id, recentJoins);

        if (recentJoins.length > settings.raid_max_joins) {
            // Potential raid detected!
            await performRaidAction(member, settings);
        }

        // Account age check
        if (settings.minAge > 0) {
            const ageInMinutes = (Date.now() - member.user.createdTimestamp) / 60000;
            if (ageInMinutes < settings.minAge) {
                await performRaidAction(member, settings, 'Account too new');
            }
        }
    } catch (error) {
        console.error('Anti-raid error:', error);
    }
}

async function performRaidAction(member, settings, reason = 'Anti-Raid Protection') {
    try {
        if (settings.action === 'kick') {
            await member.kick(reason);
        } else if (settings.action === 'ban') {
            await member.ban({ reason });
        }

        // Try to alert mods (look for a channel named 'logs' or 'mod-logs' or use first available if no log channel set)
        const alertChannel = member.guild.channels.cache.find(c => c.name.includes('log'));
        if (alertChannel) {
            const embed = {
                color: 0xff0000,
                title: '🚨 Raid Protection Triggered',
                description: `Action taken against **${member.user.tag}**`,
                fields: [{ name: 'Reason', value: reason }],
                timestamp: new Date().toISOString()
            };
            await alertChannel.send({ embeds: [embed] }).catch(() => { });
        }
    } catch (error) {
        console.error('Raid action failed:', error);
    }
}

module.exports = { handleAntiRaid };
