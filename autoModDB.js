const importedDB = require('./supabaseDB');
const { supabase } = importedDB;
console.log('[AutoModDB] Imported supabaseDB:', !!importedDB);
console.log('[AutoModDB] Extracted supabase client:', !!supabase);

const AutoModDB = {
    /**
     * Get auto-mod settings for a guild
     * @param {string} guildId 
     * @returns {Promise<Object>} Settings object
     */
    async getSettings(guildId) {
        try {
            const { data, error } = await supabase
                .from('automod_settings')
                .select('*')
                .eq('guild_id', guildId)
                .single();

            if (error && error.code !== 'PGRST116') {
                throw error;
            }

            // Return default settings if none exist
            if (!data) {
                return {
                    guild_id: guildId,
                    enabled: false,
                    modules: {
                        spam: { enabled: false, action: 'block', disabledChannels: [], disabledRoles: [] },
                        badWords: { enabled: false, action: 'block', disabledChannels: [], disabledRoles: [] },
                        duplicatedText: { enabled: false, action: 'block', disabledChannels: [], disabledRoles: [] },
                        repeatedMessages: { enabled: false, action: 'block', disabledChannels: [], disabledRoles: [] },
                        discordInvites: { enabled: false, action: 'block', disabledChannels: [], disabledRoles: [] },
                        links: { enabled: false, action: 'block', disabledChannels: [], disabledRoles: [] },
                        capsSpam: { enabled: false, action: 'block', disabledChannels: [], disabledRoles: [] },
                        emojiSpam: { enabled: false, action: 'block', disabledChannels: [], disabledRoles: [] },
                        massMention: { enabled: false, action: 'block', disabledChannels: [], disabledRoles: [] }
                    },
                    ignored_channels: [],
                    ignored_roles: [],
                    only_images_channels: [],
                    only_youtube_channels: [],
                    bad_words_list: []
                };
            }

            return data;
        } catch (error) {
            console.error('Error fetching automod settings:', error);
            throw error;
        }
    },

    /**
     * Update auto-mod settings for a guild
     * @param {string} guildId 
     * @param {Object} settings 
     * @returns {Promise<Object>} Updated settings
     */
    async updateSettings(guildId, settings) {
        try {
            const { data, error } = await supabase
                .from('automod_settings')
                .upsert({
                    guild_id: guildId,
                    ...settings,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'guild_id' })
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error updating automod settings:', error);
            throw error;
        }
    },

    /**
     * Check if a specific module is enabled
     * @param {string} guildId 
     * @param {string} moduleName 
     * @returns {Promise<boolean>}
     */
    async isModuleEnabled(guildId, moduleName) {
        try {
            const settings = await this.getSettings(guildId);
            return settings.enabled && settings.modules?.[moduleName]?.enabled;
        } catch (error) {
            console.error('Error checking module status:', error);
            return false;
        }
    },

    /**
     * Get module configuration
     * @param {string} guildId 
     * @param {string} moduleName 
     * @returns {Promise<Object|null>}
     */
    async getModuleConfig(guildId, moduleName) {
        try {
            const settings = await this.getSettings(guildId);
            return settings.modules?.[moduleName] || null;
        } catch (error) {
            console.error('Error getting module config:', error);
            return null;
        }
    }
};

module.exports = AutoModDB;
