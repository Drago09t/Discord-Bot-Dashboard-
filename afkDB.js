const fs = require('fs').promises;
const path = require('path');

const DB_FILE = path.join(__dirname, 'afk_data.json');

class AFKDB {
    constructor() {
        this.afkUsers = new Map();
        this.initialized = false;
    }

    async init() {
        if (this.initialized) return;

        try {
            const data = await fs.readFile(DB_FILE, 'utf8');
            const afkUsers = JSON.parse(data);
            this.afkUsers = new Map(Object.entries(afkUsers));
        } catch (error) {
            if (error.code === 'ENOENT') {
                this.afkUsers = new Map();
                await this.save();
            } else {
                console.error('Error loading AFK database:', error);
            }
        }
        this.initialized = true;
    }

    async save() {
        try {
            const data = Object.fromEntries(this.afkUsers);
            await fs.writeFile(DB_FILE, JSON.stringify(data, null, 2));
        } catch (error) {
            console.error('Error saving AFK database:', error);
        }
    }

    async setAFK(userId, guildId, message) {
        await this.init();
        const key = `${userId}_${guildId}`;
        const afkData = { message, timestamp: Date.now() };
        this.afkUsers.set(key, afkData);
        await this.save();
        return afkData;
    }

    async getAFK(userId, guildId) {
        await this.init();
        const key = `${userId}_${guildId}`;
        return this.afkUsers.get(key) || null;
    }

    async removeAFK(userId, guildId) {
        await this.init();
        const key = `${userId}_${guildId}`;
        if (this.afkUsers.has(key)) {
            this.afkUsers.delete(key);
            await this.save();
            return true;
        }
        return false;
    }

    async isAFK(userId, guildId) {
        await this.init();
        const key = `${userId}_${guildId}`;
        return this.afkUsers.has(key);
    }
}

module.exports = new AFKDB();
