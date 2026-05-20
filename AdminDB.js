const { createClient } = require('./sqliteDB');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '.env') });

const supabase = createClient();

class AdminDB {
    // --- Maintenance & Global Settings ---
    async getSetting(key) {
        const { data, error } = await supabase
            .from('global_settings')
            .select('value')
            .eq('key', key)
            .maybeSingle();
        return data ? data.value : null;
    }

    async setSetting(key, value) {
        const { data, error } = await supabase
            .from('global_settings')
            .upsert({ key, value, updated_at: new Date() })
            .select();
        return data;
    }

    async isMaintenanceMode() {
        const mode = await this.getSetting('maintenance_mode');
        return mode === true;
    }

    // --- Blacklist Management ---
    async isBlacklisted(targetId) {
        const { data, error } = await supabase
            .from('global_blacklist')
            .select('*')
            .eq('target_id', targetId)
            .maybeSingle();
        return !!data;
    }

    async addToBlacklist(targetId, type, reason, adminId) {
        const { data, error } = await supabase
            .from('global_blacklist')
            .upsert({ target_id: targetId, type, reason, admin_id: adminId })
            .select();
        return data;
    }

    async removeFromBlacklist(targetId) {
        const { error } = await supabase
            .from('global_blacklist')
            .delete()
            .eq('target_id', targetId);
        return !error;
    }

    async getBlacklist() {
        const { data, error } = await supabase
            .from('global_blacklist')
            .select('*')
            .order('created_at', { ascending: false });
        return data || [];
    }

    // --- Premium Vouchers ---
    async generateVoucher(tier, durationDays) {
        const code = `VORTEX-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
        const { data, error } = await supabase
            .from('premium_vouchers')
            .insert({ code, tier, duration_days: durationDays })
            .select();

        if (error) {
            console.error('SUPABASE ERROR [generateVoucher]:', error);
            return null;
        }
        return data ? data[0] : null;
    }

    async redeemVoucher(code, guildId) {
        // Find voucher
        const { data: voucher, error: vError } = await supabase
            .from('premium_vouchers')
            .select('*')
            .eq('code', code)
            .eq('is_used', false)
            .maybeSingle();

        if (vError) console.error('SUPABASE ERROR [redeemVoucher - find]:', vError);
        if (!voucher) throw new Error('Invalid or already used voucher code.');

        // Mark as used
        const { error: uError } = await supabase
            .from('premium_vouchers')
            .update({
                is_used: true,
                used_by_guild: guildId,
                used_at: new Date()
            })
            .eq('code', code);

        if (uError) throw uError;

        return voucher;
    }

    async getVouchers() {
        const { data, error } = await supabase
            .from('premium_vouchers')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('SUPABASE ERROR [getVouchers]:', error);
            return [];
        }
        return data || [];
    }

    // --- Broadcast System ---
    async logBroadcast(adminId, content, targetType) {
        const { data, error } = await supabase
            .from('global_broadcasts')
            .insert({ admin_id: adminId, message_content: content, target_type: targetType })
            .select();
        return data;
    }

    async getBroadcastHistory() {
        const { data, error } = await supabase
            .from('global_broadcasts')
            .select('*')
            .order('sent_at', { ascending: false })
            .limit(50);
        return data || [];
    }

    // --- Audit Logs (Guilds) ---
    async logGuildAction(guildId, guildName, action, memberCount) {
        const { error } = await supabase
            .from('bot_guild_logs')
            .insert({
                guild_id: guildId,
                guild_name: guildName,
                action,
                member_count: memberCount
            });
        return !error;
    }

    async getGuildLogs(limit = 100) {
        const { data, error } = await supabase
            .from('bot_guild_logs')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(limit);
        return data || [];
    }

    // --- Audit Logs (Commands) ---
    async logCommandUsage(guildId, userId, commandName, commandType) {
        const { error } = await supabase
            .from('bot_command_logs')
            .insert({
                guild_id: guildId,
                user_id: userId,
                command_name: commandName,
                command_type: commandType
            });
        return !error;
    }

    async getCommandLogs(limit = 100) {
        const { data, error } = await supabase
            .from('bot_command_logs')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(limit);
        return data || [];
    }

    async getCommandStats() {
        // Get counts grouped by command name
        const { data, error } = await supabase
            .from('bot_command_logs')
            .select('command_name, command_type');

        if (error) return [];

        const stats = data.reduce((acc, log) => {
            acc[log.command_name] = (acc[log.command_name] || 0) + 1;
            return acc;
        }, {});

        return Object.entries(stats)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 10);
    }

    async getAllActiveTickets() {
        const { data, error } = await supabase
            .from('active_tickets')
            .select('*')
            .eq('status', 'open')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    }
}

module.exports = new AdminDB();
