const fs = require('fs').promises;
const path = require('path');

const DB_FILE = path.join(__dirname, 'autorole_data.json');

class AutoRoleDB {
    constructor() {
        this.roles = new Map();
        this.initialized = false;
    }

    async init() {
        if (this.initialized) return;

        try {
            const data = await fs.readFile(DB_FILE, 'utf8');
            const roles = JSON.parse(data);
            this.roles = new Map(Object.entries(roles));
        } catch (error) {
            if (error.code === 'ENOENT') {
                this.roles = new Map();
                await this.save();
            } else {
                console.error('Error loading autorole database:', error);
            }
        }
        this.initialized = true;
    }

    async save() {
        try {
            const data = Object.fromEntries(this.roles);
            await fs.writeFile(DB_FILE, JSON.stringify(data, null, 2));
        } catch (error) {
            console.error('Error saving autorole database:', error);
        }
    }

    async setAutoRoles(guildId, roleIds) {
        await this.init();
        this.roles.set(guildId, roleIds);
        await this.save();
        return roleIds;
    }

    async getAutoRoles(guildId) {
        await this.init();
        return this.roles.get(guildId) || [];
    }

    async removeAutoRole(guildId, roleId) {
        await this.init();
        let roles = await this.getAutoRoles(guildId);
        roles = roles.filter(id => id !== roleId);
        this.roles.set(guildId, roles);
        await this.save();
        return roles;
    }
}

module.exports = new AutoRoleDB();
