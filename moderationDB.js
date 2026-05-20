const { createClient } = require('./sqliteDB');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const supabase = createClient();

class ModerationDB {
    /**
     * Fetch moderation settings for a specific guild.
     * @param {string} guildId 
     * @returns {Promise<Array>} List of settings for all commands in the guild.
     */
    async getSettings(guildId) {
        const { data, error } = await supabase
            .from('moderation_settings')
            .select('*')
            .eq('guild_id', guildId);

        if (error) throw error;
        return data || [];
    }

    /**
     * Get setting for a single command.
     * @param {string} guildId 
     * @param {string} commandName 
     * @returns {Promise<Object|null>}
     */
    async getCommandSetting(guildId, commandName) {
        const { data, error } = await supabase
            .from('moderation_settings')
            .select('*')
            .eq('guild_id', guildId)
            .eq('command_name', commandName)
            .maybeSingle();

        if (error) throw error;
        return data;
    }

    /**
     * Update or insert a moderation setting.
     * @param {string} guildId 
     * @param {string} commandName 
     * @param {Object} updates { enabled: boolean, allowed_roles: string[], allowed_channels: string[] }
     */
    async updateSetting(guildId, commandName, updates) {
        const { data, error } = await supabase
            .from('moderation_settings')
            .upsert({
                guild_id: guildId,
                command_name: commandName,
                ...updates,
                updated_at: new Date().toISOString()
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    /**
     * Reset specific setting or all settings for a guild (Optional utility)
     */
    async deleteSetting(guildId, commandName) {
        const { error } = await supabase
            .from('moderation_settings')
            .delete()
            .eq('guild_id', guildId)
            .eq('command_name', commandName);

        if (error) throw error;
    }
}

module.exports = new ModerationDB();
