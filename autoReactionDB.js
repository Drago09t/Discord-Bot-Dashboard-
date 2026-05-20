const fs = require('fs').promises;
const path = require('path');

const DB_FILE = path.join(__dirname, 'autoreaction_data.json');

class AutoReactionDB {
    constructor() {
        this.reactions = new Map();
        this.initialized = false;
    }

    async init() {
        if (this.initialized) return;

        try {
            const data = await fs.readFile(DB_FILE, 'utf8');
            const reactions = JSON.parse(data);
            this.reactions = new Map(Object.entries(reactions));
        } catch (error) {
            if (error.code === 'ENOENT') {
                this.reactions = new Map();
                await this.save();
            } else {
                console.error('Error loading auto-reaction database:', error);
            }
        }
        this.initialized = true;
    }

    async save() {
        try {
            const data = Object.fromEntries(this.reactions);
            await fs.writeFile(DB_FILE, JSON.stringify(data, null, 2));
        } catch (error) {
            console.error('Error saving auto-reaction database:', error);
        }
    }

    async addReaction(guildId, keyword, emoji) {
        await this.init();
        const guildReactions = this.reactions.get(guildId) || [];
        guildReactions.push({ keyword: keyword.toLowerCase(), emoji });
        this.reactions.set(guildId, guildReactions);
        await this.save();
        return guildReactions;
    }

    async removeReaction(guildId, keyword) {
        await this.init();
        let guildReactions = this.reactions.get(guildId) || [];
        guildReactions = guildReactions.filter(r => r.keyword !== keyword.toLowerCase());
        this.reactions.set(guildId, guildReactions);
        await this.save();
        return guildReactions;
    }

    async getReactions(guildId) {
        await this.init();
        return this.reactions.get(guildId) || [];
    }
}

module.exports = new AutoReactionDB();
