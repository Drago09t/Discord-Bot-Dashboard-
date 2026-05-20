const fs = require('fs').promises;
const path = require('path');

const DB_FILE = path.join(__dirname, 'welcome_data.json');

class WelcomeDB {
    constructor() {
        this.settings = new Map();
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
                console.error('Error loading welcome database:', error);
            }
        }
        this.initialized = true;
    }

    async save() {
        try {
            const data = Object.fromEntries(this.settings);
            await fs.writeFile(DB_FILE, JSON.stringify(data, null, 2));
        } catch (error) {
            console.error('Error saving welcome database:', error);
        }
    }

    async setWelcome(guildId, channelId, message) {
        await this.init();
        const config = this.settings.get(guildId) || {};
        config.welcome = { channelId, message, enabled: true };
        this.settings.set(guildId, config);
        await this.save();
        return config.welcome;
    }

    async setGoodbye(guildId, channelId, message) {
        await this.init();
        const config = this.settings.get(guildId) || {};
        config.goodbye = { channelId, message, enabled: true };
        this.settings.set(guildId, config);
        await this.save();
        return config.goodbye;
    }

    async getSettings(guildId) {
        await this.init();
        return this.settings.get(guildId) || null;
    }

    async disableWelcome(guildId) {
        await this.init();
        const config = this.settings.get(guildId);
        if (config && config.welcome) {
            config.welcome.enabled = false;
            await this.save();
            return true;
        }
        return false;
    }

    async disableGoodbye(guildId) {
        await this.init();
        const config = this.settings.get(guildId);
        if (config && config.goodbye) {
            config.goodbye.enabled = false;
            await this.save();
            return true;
        }
        return false;
    }
}

module.exports = new WelcomeDB();
