const supabaseDB = require('./supabaseDB');

class RankingDB {
    constructor() {
        // No longer need local map or filesystem
    }

    async init() {
        // Supabase client is already initialized in supabaseDB
        return true;
    }

    async getUser(userId, guildId) {
        try {
            const data = await supabaseDB.getUserRanking(guildId, userId);
            if (!data) return null;

            // Map Supabase snake_case to JS camelCase if needed for compatibility
            return {
                userId: data.user_id,
                guildId: data.guild_id,
                username: data.username,
                xp: data.xp,
                level: data.level,
                totalMessages: data.total_messages,
                lastXPTime: data.last_xp_time
            };
        } catch (error) {
            console.error('Error getting user from Supabase:', error);
            return null;
        }
    }

    async createUser(userId, guildId, username) {
        const userData = {
            username,
            xp: 0,
            level: 1,
            total_messages: 0,
            last_xp_time: new Date().toISOString()
        };

        try {
            const data = await supabaseDB.updateUserRanking(guildId, userId, userData);
            return {
                userId: data.user_id,
                guildId: data.guild_id,
                username: data.username,
                xp: data.xp,
                level: data.level,
                totalMessages: data.total_messages,
                lastXPTime: data.last_xp_time
            };
        } catch (error) {
            console.error('Error creating user in Supabase:', error);
            throw error;
        }
    }

    async addXP(userId, guildId, username, xpAmount) {
        let user = await this.getUser(userId, guildId);

        if (!user) {
            user = await this.createUser(userId, guildId, username);
        }

        // Update user data
        const newXP = parseInt(user.xp) + xpAmount;
        const totalMessages = (parseInt(user.totalMessages) || 0) + 1;
        const lastXPTime = new Date().toISOString();

        // Calculate level
        const oldLevel = user.level;
        const newLevel = this.calculateLevel(newXP);
        const leveledUp = newLevel > oldLevel;

        const updates = {
            username,
            xp: newXP,
            level: newLevel,
            total_messages: totalMessages,
            last_xp_time: lastXPTime
        };

        const updatedData = await supabaseDB.updateUserRanking(guildId, userId, updates);

        const result = {
            user: {
                userId: updatedData.user_id,
                guildId: updatedData.guild_id,
                username: updatedData.username,
                xp: updatedData.xp,
                level: updatedData.level,
                totalMessages: updatedData.total_messages,
                lastXPTime: updatedData.last_xp_time
            },
            leveledUp,
            oldLevel,
            newLevel
        };

        return result;
    }

    calculateLevel(xp) {
        // Progressive level formula: level * 100 XP needed
        let level = 1;
        let xpNeeded = 0;

        while (xp >= xpNeeded) {
            level++;
            xpNeeded += level * 100;
        }

        return level - 1;
    }

    getXPForLevel(level) {
        let totalXP = 0;
        for (let i = 1; i <= level; i++) {
            totalXP += i * 100;
        }
        return totalXP;
    }

    getXPForNextLevel(currentLevel) {
        return (currentLevel + 1) * 100;
    }

    async getLeaderboard(guildId, limit = 10) {
        try {
            const leaderboard = await supabaseDB.getLeaderboard(guildId, limit);
            return leaderboard.map(data => ({
                userId: data.user_id,
                guildId: data.guild_id,
                username: data.username,
                xp: data.xp,
                level: data.level,
                totalMessages: data.total_messages,
                last_xp_time: data.last_xp_time
            }));
        } catch (error) {
            console.error('Error getting leaderboard from Supabase:', error);
            return [];
        }
    }

    async getUserRank(userId, guildId) {
        const leaderboard = await this.getLeaderboard(guildId, 1000);
        const rank = leaderboard.findIndex(u => u.userId === userId) + 1;
        return rank || null;
    }

    async setXP(userId, guildId, username, newXP) {
        const newLevel = this.calculateLevel(newXP);
        const updates = {
            username,
            xp: Math.max(0, newXP),
            level: newLevel,
            last_xp_time: new Date().toISOString()
        };

        const data = await supabaseDB.updateUserRanking(guildId, userId, updates);
        return {
            userId: data.user_id,
            guildId: data.guild_id,
            username: data.username,
            xp: data.xp,
            level: data.level,
            totalMessages: data.total_messages,
            lastXPTime: data.last_xp_time
        };
    }

    async resetGuild(guildId) {
        try {
            await supabaseDB.resetRanking(guildId);
            return true;
        } catch (error) {
            console.error('Error resetting guild ranking:', error);
            return false;
        }
    }
}

module.exports = new RankingDB();
