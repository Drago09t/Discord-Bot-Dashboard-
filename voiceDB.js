const fs = require('fs').promises;
const path = require('path');

const DB_FILE = path.join(__dirname, 'voice_247_channels.json');

class VoiceDB {
    constructor() {
        this.channels = new Map();
        this.initialized = false;
    }

    async init() {
        if (this.initialized) return;

        try {
            const data = await fs.readFile(DB_FILE, 'utf8');
            const channels = JSON.parse(data);
            this.channels = new Map(Object.entries(channels));
        } catch (error) {
            if (error.code === 'ENOENT') {
                this.channels = new Map();
                await this.save();
            } else {
                console.error('Error loading voice 24/7 database:', error);
            }
        }
        this.initialized = true;
    }

    async save() {
        try {
            const data = Object.fromEntries(this.channels);
            await fs.writeFile(DB_FILE, JSON.stringify(data, null, 2));
        } catch (error) {
            console.error('Error saving voice 24/7 database:', error);
        }
    }

    async add247Channel(guildId, channelId, channelName, createdBy) {
        await this.init();

        const channelData = {
            guildId,
            channelId,
            channelName,
            enabled: true,
            createdBy,
            createdAt: new Date().toISOString(),
        };

        this.channels.set(channelId, channelData);
        await this.save();
        return channelData;
    }

    async remove247Channel(channelId) {
        await this.init();
        const existed = this.channels.delete(channelId);
        if (existed) {
            await this.save();
        }
        return existed;
    }

    async is247Channel(channelId) {
        await this.init();
        return this.channels.has(channelId);
    }

    async get247Channels() {
        await this.init();
        return Array.from(this.channels.values());
    }

    async get247ChannelsByGuild(guildId) {
        await this.init();
        const guildChannels = [];
        for (const [channelId, data] of this.channels.entries()) {
            if (data.guildId === guildId) {
                guildChannels.push(data);
            }
        }
        return guildChannels;
    }
}

module.exports = new VoiceDB();
