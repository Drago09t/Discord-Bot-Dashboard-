const fs = require('fs').promises;
const path = require('path');

const DB_FILE = path.join(__dirname, 'raid_data.json');

class RaidDB {
    constructor() {
        this.settings = new Map();
        this.joins = new Map(); // In-memory join tracking
        this.initialized = false;
    }

    async init() {
        if (this.initialized) return;

        try {
            const data = await fs.readFile(DB_FILE, 'utf8');
            const settings = JSON.parse(data);
            this.settings = new Map(Object.entries(settings));
        } catch (error) {
            if (error.code === 'ENOENT') {
                this.settings = new Map();
                await this.save();
            } else {
                console.error('Error loading raid database:', error);
            }
        }
        this.initialized = true;
    }

    async save() {
        try {
            const data = Object.fromEntries(this.settings);
            await fs.writeFile(DB_FILE, JSON.stringify(data, null, 2));
        } catch (error) {
            console.error('Error saving raid database:', error);
        }
    }

    async getSettings(guildId) {
        await this.init();
        return this.settings.get(guildId) || {
            enabled: false,
            maxJoins: 5,
            window: 10000, // 10 seconds
            minAge: 0,     // minutes
            action: 'kick' // kick or ban
        };
    }

    async updateSettings(guildId, updates) {
        await this.init();
        const current = await this.getSettings(guildId);
        const updated = { ...current, ...updates };
        this.settings.set(guildId, updated);
        await this.save();
        return updated;
    }

    trackJoin(guildId) {
        const now = Date.now();
        const guildJoins = this.joins.get(guildId) || [];
        guildJoins.push(now);

        // Clean up joins outside the window (max 30 seconds for safety)
        const windowJoins = guildJoins.filter(time => now - time < 30000);
        this.joins.set(guildId, windowJoins);

        return windowJoins;
    }
}

module.exports = new RaidDB();
