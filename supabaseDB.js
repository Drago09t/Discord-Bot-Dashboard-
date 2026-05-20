const { createClient } = require('./sqliteDB');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const supabase = createClient();


class SupabaseDB {
    // --- Guild Settings (Welcome, Moderation, etc.) ---
    async getGuildSettings(guildId) {
        const { data, error } = await supabase
            .from('guild_settings')
            .select('*')
            .eq('guild_id', guildId)
            .maybeSingle();

        if (error) throw error;
        return data || await this.initGuildSettings(guildId);
    }

    async initGuildSettings(guildId) {
        const { data, error } = await supabase
            .from('guild_settings')
            .insert({ guild_id: guildId })
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async updateGuildSettings(guildId, updates) {
        const { data, error } = await supabase
            .from('guild_settings')
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('guild_id', guildId)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async getPrefix(guildId) {
        const { data, error } = await supabase
            .from('guild_settings')
            .select('prefix')
            .eq('guild_id', guildId)
            .maybeSingle();

        if (error) throw error;
        return data?.prefix || '!';
    }

    async updatePrefix(guildId, prefix) {
        const { data, error } = await supabase
            .from('guild_settings')
            .upsert({ guild_id: guildId, prefix, updated_at: new Date().toISOString() })
            .select()
            .single();

        if (error) throw error;
        return data?.prefix;
    }

    // --- Bad Words ---
    async getBadWords(guildId) {
        const { data, error } = await supabase
            .from('bad_words')
            .select('word')
            .eq('guild_id', guildId);

        if (error) throw error;
        return data.map(row => row.word);
    }

    async addBadWord(guildId, word) {
        const { error } = await supabase
            .from('bad_words')
            .upsert({ guild_id: guildId, word: word.toLowerCase() });
        if (error) throw error;
    }

    async removeBadWord(guildId, word) {
        const { error } = await supabase
            .from('bad_words')
            .delete()
            .eq('guild_id', guildId)
            .eq('word', word.toLowerCase());
        if (error) throw error;
    }

    // --- Auto Roles ---
    async getAutoRoles(guildId) {
        const { data, error } = await supabase
            .from('auto_roles')
            .select('role_id')
            .eq('guild_id', guildId);

        if (error) throw error;
        if (error) throw error;
        return (data || []).map(row => row.role_id);
    }

    async addAutoRole(guildId, roleId) {
        const { error } = await supabase
            .from('auto_roles')
            .upsert({ guild_id: guildId, role_id: roleId });
        if (error) throw error;
    }

    async removeAutoRole(guildId, roleId) {
        const { error } = await supabase
            .from('auto_roles')
            .delete()
            .eq('guild_id', guildId)
            .eq('role_id', roleId);
        if (error) throw error;
    }

    // --- Auto Reactions ---
    async getAutoReactions(guildId) {
        const { data, error } = await supabase
            .from('auto_reactions')
            .select('keyword, emoji')
            .eq('guild_id', guildId);

        if (error) throw error;
        return data || [];
    }

    async addAutoReaction(guildId, keyword, emoji) {
        const { error } = await supabase
            .from('auto_reactions')
            .upsert({ guild_id: guildId, keyword: keyword.toLowerCase(), emoji });
        if (error) throw error;
    }

    async removeAutoReaction(guildId, keyword) {
        const { error } = await supabase
            .from('auto_reactions')
            .delete()
            .eq('guild_id', guildId)
            .eq('keyword', keyword.toLowerCase());
        if (error) throw error;
    }

    // --- Reaction Roles ---
    async getReactionRoles(guildId) {
        const { data, error } = await supabase
            .from('reaction_roles')
            .select('*')
            .eq('guild_id', guildId);

        if (error) throw error;
        return data || [];
    }

    async addReactionRole(guildId, messageId, emoji, roleId) {
        const { data, error } = await supabase
            .from('reaction_roles')
            .upsert({
                guild_id: guildId,
                message_id: messageId,
                emoji,
                role_id: roleId
            }, { onConflict: 'guild_id, message_id, emoji' })
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async removeReactionRole(guildId, messageId, emoji) {
        const { error } = await supabase
            .from('reaction_roles')
            .delete()
            .eq('guild_id', guildId)
            .eq('message_id', messageId)
            .eq('emoji', emoji);
        if (error) throw error;
    }

    // --- AFK System ---
    async getAFK(userId, guildId) {
        const { data, error } = await supabase
            .from('afk_status')
            .select('*')
            .eq('user_id', userId)
            .eq('guild_id', guildId)
            .maybeSingle();

        if (error) throw error;
        return data;
    }

    async isAFK(userId, guildId) {
        const data = await this.getAFK(userId, guildId);
        return !!data;
    }

    async setAFK(userId, guildId, message) {
        const { error } = await supabase
            .from('afk_status')
            .upsert({
                user_id: userId,
                guild_id: guildId,
                message,
                timestamp: Date.now()
            });
        if (error) throw error;
    }

    async removeAFK(userId, guildId) {
        const { error } = await supabase
            .from('afk_status')
            .delete()
            .eq('user_id', userId)
            .eq('guild_id', guildId);
        if (error) throw error;
    }

    // --- Activity Tracking ---
    async trackActivity(guildId, userId, channelId) {
        // Upsert logic for activity tracking
        const { data: existing } = await supabase
            .from('activity_tracking')
            .select('message_count')
            .eq('guild_id', guildId)
            .eq('user_id', userId)
            .eq('channel_id', channelId)
            .maybeSingle();

        if (existing) {
            await supabase
                .from('activity_tracking')
                .update({
                    message_count: existing.message_count + 1,
                    last_message_at: new Date().toISOString()
                })
                .eq('guild_id', guildId)
                .eq('user_id', userId)
                .eq('channel_id', channelId);
        } else {
            await supabase
                .from('activity_tracking')
                .insert({ guild_id: guildId, user_id: userId, channel_id: channelId });
        }
    }

    async getTopUsers(guildId, limit = 10) {
        const { data, error } = await supabase
            .from('activity_tracking')
            .select('user_id, message_count')
            .eq('guild_id', guildId)
            .order('message_count', { ascending: false })
            .limit(limit);

        if (error) throw error;
        return data || [];
    }

    async getTopChannels(guildId, limit = 10) {
        const { data, error } = await supabase
            .from('activity_tracking')
            .select('channel_id, message_count')
            .eq('guild_id', guildId)
            .order('message_count', { ascending: false })
            .limit(limit);

        if (error) throw error;
        return data || [];
    }
    // --- User Profiles ---
    async getUserProfile(userId) {
        const { data, error } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('user_id', userId)
            .maybeSingle();

        if (error) throw error;

        // Return existing profile or default structure if not found
        return data || {
            user_id: userId,
            bio: 'No bio set.',
            background_url: null,
            theme_color: '#6366f1',
            twitter_url: null,
            twitch_url: null,
            youtube_url: null,
            website_url: null
        };
    }

    async updateUserProfile(userId, updates) {
        // Prepare update data, removing any immutable fields if necessary
        const allowedUpdates = {
            bio: updates.bio,
            background_url: updates.background_url,
            theme_color: updates.theme_color,
            twitter_url: updates.twitter_url,
            twitch_url: updates.twitch_url,
            youtube_url: updates.youtube_url,
            website_url: updates.website_url,
            updated_at: new Date().toISOString()
        };

        const { data, error } = await supabase
            .from('user_profiles')
            .upsert({ user_id: userId, ...allowedUpdates })
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    // --- Global Stats ---
    async getGlobalStats(userId) {
        const { data: rankings, error: rankingError } = await supabase
            .from('user_rankings')
            .select('xp, level')
            .eq('user_id', userId);

        const { data: activity, error: activityError } = await supabase
            .from('activity_tracking')
            .select('message_count')
            .eq('user_id', userId);

        if (rankingError || activityError) throw rankingError || activityError;

        const totalXP = rankings?.reduce((sum, r) => sum + (r.xp || 0), 0) || 0;
        const totalMessages = activity?.reduce((sum, a) => sum + (a.message_count || 0), 0) || 0;
        const maxLevel = rankings?.reduce((max, r) => Math.max(max, r.level || 0), 0) || 0;
        const serverCount = rankings?.length || 0;

        return {
            totalXP,
            totalMessages,
            maxLevel,
            serverCount
        };
    }

    // --- Advanced Logging Settings ---
    async getLogSettings(guildId) {
        const { data, error } = await supabase
            .from('log_settings')
            .select('*')
            .eq('guild_id', guildId);

        if (error) throw error;
        return data || [];
    }

    async upsertLogSetting(guildId, eventType, updates) {
        const { data, error } = await supabase
            .from('log_settings')
            .upsert({
                guild_id: guildId,
                event_type: eventType,
                ...updates,
                updated_at: new Date().toISOString()
            }, { onConflict: 'guild_id, event_type' })
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    // --- User Rankings (XP System) ---
    async getUserRanking(guildId, userId) {
        const { data, error } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('guild_id', guildId)
            .eq('user_id', userId)
            .maybeSingle();

        if (error) throw error;
        return data;
    }

    async updateUserRanking(guildId, userId, updates) {
        const { data, error } = await supabase
            .from('user_profiles')
            .upsert({
                guild_id: guildId,
                user_id: userId,
                ...updates
            }, { onConflict: 'guild_id, user_id' })
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async getLeaderboard(guildId, limit = 100) {
        const { data, error } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('guild_id', guildId)
            .order('xp', { ascending: false })
            .limit(limit);

        if (error) throw error;
        return data || [];
    }

    async resetRanking(guildId) {
        const { error } = await supabase
            .from('user_profiles')
            .delete()
            .eq('guild_id', guildId);
        if (error) throw error;
    }

    // --- Ticket System ---
    async getTicketSettings(guildId) {
        const { data, error } = await supabase
            .from('ticket_settings')
            .select('*')
            .eq('guild_id', guildId)
            .maybeSingle();

        if (error) throw error;
        return data || { guild_id: guildId, enabled: false, limit_per_user: 1 };
    }

    async updateTicketSettings(guildId, updates) {
        const { data, error } = await supabase
            .from('ticket_settings')
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

    async getTicketPanels(guildId) {
        const { data, error } = await supabase
            .from('ticket_panels')
            .select('*')
            .eq('guild_id', guildId)
            .order('created_at', { ascending: true });

        if (error) throw error;
        return data || [];
    }

    async createTicketPanel(panelData) {
        const { data, error } = await supabase
            .from('ticket_panels')
            .insert(panelData)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async deleteTicketPanel(guildId, panelId) {
        const { error } = await supabase
            .from('ticket_panels')
            .delete()
            .eq('guild_id', guildId)
            .eq('id', panelId);

        if (error) throw error;
    }

    async createTicket(ticketData) {
        const { data, error } = await supabase
            .from('active_tickets')
            .insert(ticketData)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async closeTicket(channelId) {
        // Just remove from active_tickets, strictly speaking. Or update status to closed.
        // We'll delete it to keep the active list clean.
        const { error } = await supabase
            .from('active_tickets')
            .delete()
            .eq('channel_id', channelId);

        if (error) throw error;
    }

    async getActiveTickets(guildId) {
        const { data, error } = await supabase
            .from('active_tickets')
            .select('*')
            .eq('guild_id', guildId);

        if (error) throw error;
        return data || [];
    }

    // --- Embed Templates ---
    async getEmbedTemplates(guildId) {
        const { data, error } = await supabase
            .from('embed_templates')
            .select('*')
            .eq('guild_id', guildId)
            .order('updated_at', { ascending: false });

        if (error) throw error;
        return data || [];
    }

    async saveEmbedTemplate(guildId, name, content, buttons) {
        const { data, error } = await supabase
            .from('embed_templates')
            .upsert({
                guild_id: guildId,
                name,
                content,
                buttons,
                updated_at: new Date().toISOString()
            }, { onConflict: 'guild_id, name' })
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async deleteEmbedTemplate(guildId, id) {
        const { error } = await supabase
            .from('embed_templates')
            .delete()
            .eq('guild_id', guildId)
            .eq('id', id);

        if (error) throw error;
    }
    // --- Social Notifications ---
    async getSocialNotifications(guildId) {
        const { data, error } = await supabase
            .from('social_notifications')
            .select('*')
            .eq('guild_id', guildId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    }

    async addSocialNotification(guildId, platform, channelId, channelName, notificationChannelId, message) {
        const { data, error } = await supabase
            .from('social_notifications')
            .upsert({
                guild_id: guildId,
                platform,
                channel_id: channelId,
                channel_name: channelName,
                notification_channel_id: notificationChannelId,
                message: message || '{author} is now live on {platform}! {url}'
            }, { onConflict: 'guild_id, platform, channel_id' })
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async updateSocialNotification(id, updates) {
        const { data, error } = await supabase
            .from('social_notifications')
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async removeSocialNotification(id) {
        const { error } = await supabase
            .from('social_notifications')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }

    async getAllSocialNotifications() {
        const { data, error } = await supabase
            .from('social_notifications')
            .select('*')
            .eq('enabled', true);

        if (error) throw error;
        return data || [];
    }
}

const dbInstance = new SupabaseDB();
dbInstance.supabase = supabase;
console.log('[SupabaseDB] Exporting instance with supabase client:', !!dbInstance.supabase);
module.exports = dbInstance;
