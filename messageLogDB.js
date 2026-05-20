const fs = require('fs').promises;
const path = require('path');

const DB_FILE = path.join(__dirname, 'messagelog_data.json');

class MessageLogDB {
    constructor() {
        this.logs = new Map();
        this.initialized = false;
    }

    async init() {
        if (this.initialized) return;

        try {
            const data = await fs.readFile(DB_FILE, 'utf8');
            const logs = JSON.parse(data);
            this.logs = new Map(Object.entries(logs));
        } catch (error) {
            if (error.code === 'ENOENT') {
                this.logs = new Map();
                await this.save();
            } else {
                console.error('Error loading messagelog database:', error);
            }
        }
        this.initialized = true;
    }

    async save() {
        try {
            const data = Object.fromEntries(this.logs);
            await fs.writeFile(DB_FILE, JSON.stringify(data, null, 2));
        } catch (error) {
            console.error('Error saving messagelog database:', error);
        }
    }

    async setLogChannel(guildId, channelId) {
        await this.init();
        this.logs.set(guildId, { channelId, enabled: true });
        await this.save();
        return channelId;
    }

    async getLogChannel(guildId) {
        await this.init();
        return this.logs.get(guildId) || null;
    }

    async disableLogs(guildId) {
        await this.init();
        const config = this.logs.get(guildId);
        if (config) {
            config.enabled = false;
            await this.save();
            return true;
        }
        return false;
    }
}

module.exports = new MessageLogDB();
