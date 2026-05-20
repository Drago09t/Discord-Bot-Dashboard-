const { Collection } = require('discord.js');
const database = require('./database');

function fetchWithTimeout(promise, timeoutMs = 5000) {
    let timeoutId;
    const timeoutPromise = new Promise((_, reject) => {
        timeoutId = setTimeout(() => {
            reject(new Error('Request timed out'));
        }, timeoutMs);
    });
    return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timeoutId));
}

class InviteTracker {
    constructor() {
        this.invites = new Collection(); // Map<guildId, Collection<code, uses>>
    }

    async init(client) {
        console.log('[InviteTracker] Initializing invite cache...');
        const promises = Array.from(client.guilds.cache.values()).map(async (guild) => {
            try {
                const guildInvites = await fetchWithTimeout(guild.invites.fetch(), 5000);
                this.invites.set(guild.id, new Collection(guildInvites.map(invite => [invite.code, invite.uses])));
            } catch (err) {
                console.error(`[InviteTracker] Could not fetch invites for ${guild.name}:`, err.message);
            }
        });
        await Promise.all(promises);
        console.log('[InviteTracker] Invite cache initialized.');
    }

    async handleJoin(member) {
        const { guild } = member;
        try {
            const currentInvites = await guild.invites.fetch();
            const cachedInvites = this.invites.get(guild.id);

            // Re-cache for next time
            this.invites.set(guild.id, new Collection(currentInvites.map(invite => [invite.code, invite.uses])));

            if (!cachedInvites) return null;

            // Find which invite's use count increased
            const usedInvite = currentInvites.find(inv => {
                const cachedUses = cachedInvites.get(inv.code) || 0;
                return inv.uses > cachedUses;
            });

            if (usedInvite) {
                console.log(`[InviteTracker] ${member.user.tag} joined ${guild.name} using code ${usedInvite.code} by ${usedInvite.inviter?.tag || 'Unknown'}`);
                return usedInvite;
            }
        } catch (err) {
            console.error(`[InviteTracker] Error tracking join for ${member.user.tag}:`, err);
        }
        return null;
    }

    async handleInviteCreate(invite) {
        let guildInvites = this.invites.get(invite.guild.id);
        if (!guildInvites) {
            guildInvites = new Collection();
            this.invites.set(invite.guild.id, guildInvites);
        }
        guildInvites.set(invite.code, invite.uses);
    }

    async handleInviteDelete(invite) {
        const guildInvites = this.invites.get(invite.guild.id);
        if (guildInvites) {
            guildInvites.delete(invite.code);
        }
    }
}

module.exports = new InviteTracker();
