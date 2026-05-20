const fs = require('fs').promises;
const path = require('path');

const DB_FILE = path.join(__dirname, 'activity_data.json');

class ActivityDB {
    constructor() {
        this.activity = new Map();
        this.initialized = false;
    }

    async init() {
        if (this.initialized) return;

        try {
            const data = await fs.readFile(DB_FILE, 'utf8');
            const activity = JSON.parse(data);
            this.activity = new Map(Object.entries(activity));
        } catch (error) {
            if (error.code === 'ENOENT') {
                this.activity = new Map();
                await this.save();
            } else {
                console.error('Error loading activity database:', error);
            }
        }
        this.initialized = true;
    }

    async save() {
        try {
            const data = Object.fromEntries(this.activity);
            await fs.writeFile(DB_FILE, JSON.stringify(data, null, 2));
        } catch (error) {
            console.error('Error saving activity database:', error);
        }
    }

    async trackMessage(guildId, userId, channelId) {
        await this.init();
        const guildActivity = this.activity.get(guildId) || { users: {}, channels: {} };

        guildActivity.users[userId] = (guildActivity.users[userId] || 0) + 1;
        guildActivity.channels[channelId] = (guildActivity.channels[channelId] || 0) + 1;

        this.activity.set(guildId, guildActivity);
        await this.save();
    }

    async getTopUsers(guildId, limit = 10) {
        await this.init();
        const guildActivity = this.activity.get(guildId);
        if (!guildActivity) return [];

        return Object.entries(guildActivity.users)
            .sort(([, a], [, b]) => b - a)
            .slice(0, limit);
    }

    async getTopChannels(guildId, limit = 10) {
        await this.init();
        const guildActivity = this.activity.get(guildId);
        if (!guildActivity) return [];

        return Object.entries(guildActivity.channels)
            .sort(([, a], [, b]) => b - a)
            .slice(0, limit);
    }
}

module.exports = new ActivityDB();
