console.log('[PremiumDB] Library loading...');
const { createClient } = require('./sqliteDB');
const path = require('path');
const dotenv = require('dotenv');

// Fix path for .env
dotenv.config({ path: path.join(__dirname, '.env') });

const supabase = createClient();

class PremiumDB {
    // --- Premium Management ---
    async getPremiumSettings(guildId) {
        const { data, error } = await supabase
            .from('premium_settings')
            .select('*')
            .eq('guild_id', guildId)
            .maybeSingle();

        if (error) throw error;
        return data || { premium_enabled: false, premium_tier: 0, features_unlocked: [] };
    }

    async updatePremiumSettings(guildId, updates) {
        const { data, error } = await supabase
            .from('premium_settings')
            .upsert({
                guild_id: guildId,
                ...updates,
                updated_at: new Date().toISOString()
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async removePremium(guildId) {
        const { error } = await supabase
            .from('premium_settings')
            .delete()
            .eq('guild_id', guildId);

        if (error) throw error;
        return true;
    }

    async getAllPremiumServers() {
        const { data, error } = await supabase
            .from('premium_settings')
            .select('*')
            .eq('premium_enabled', true);

        if (error) throw error;
        return data || [];
    }

    // --- Admin Management ---
    async isBotAdmin(userId) {
        const { data, error } = await supabase
            .from('bot_admins')
            .select('*')
            .eq('user_id', userId)
            .maybeSingle();

        if (error) return false;
        // Also check if they are the owner from .env just in case
        if (userId === process.env.OWNER_ID) return true;
        return !!data;
    }

    async addBotAdmin(userId, role = 'owner') {
        const { data, error } = await supabase
            .from('bot_admins')
            .upsert({ user_id: userId, role });

        if (error) throw error;
        return data;
    }

    async removeBotAdmin(userId) {
        const { error } = await supabase
            .from('bot_admins')
            .delete()
            .eq('user_id', userId);

        if (error) throw error;
        return true;
    }

    async getBotAdmins() {
        const { data, error } = await supabase
            .from('bot_admins')
            .select('*');

        if (error) throw error;
        return data || [];
    }
}

module.exports = new PremiumDB();
