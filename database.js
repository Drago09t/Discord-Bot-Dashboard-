const importedDB = require('./supabaseDB');
const { supabase } = importedDB;

class Database {
  async getUserProfile(userId, guildId) {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .eq('guild_id', guildId)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async createUserProfile(userId, guildId) {
    const { data, error } = await supabase
      .from('user_profiles')
      .insert({
        user_id: userId,
        guild_id: guildId,
        coins: 100,
        xp: 0,
        level: 1,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getOrCreateProfile(userId, guildId) {
    // Better atomic handling using upsert with the unique constraint
    const { data, error } = await supabase
      .from('user_profiles')
      .upsert({
        user_id: userId,
        guild_id: guildId,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'guild_id, user_id'
      })
      .select()
      .single();

    if (error) {
      console.error(`[Database] Error in getOrCreateProfile for ${userId}:`, error);
      throw error;
    }
    return data;
  }

  async updateProfile(userId, guildId, updates) {
    const { data, error } = await supabase
      .from('user_profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('user_id', userId)
      .eq('guild_id', guildId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async addCoins(userId, guildId, amount) {
    const profile = await this.getOrCreateProfile(userId, guildId);
    return await this.updateProfile(userId, guildId, {
      coins: profile.coins + amount,
    });
  }

  async addXP(userId, guildId, amount) {
    const profile = await this.getOrCreateProfile(userId, guildId);
    const newXP = (profile.xp || 0) + amount;

    // Progressive level formula: each level needs more XP (Level * 100)
    let level = 1;
    let xpNeeded = 0;
    while (newXP >= xpNeeded) {
      level++;
      xpNeeded += level * 100;
    }
    const newLevel = level - 1;

    return await this.updateProfile(userId, guildId, {
      xp: newXP,
      level: newLevel,
      total_messages: (profile.total_messages || 0) + 1
    });
  }

  async getLeaderboard(guildId, type = 'xp', limit = 10) {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('guild_id', guildId)
      .order(type, { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  async claimDaily(userId, guildId) {
    const profile = await this.getOrCreateProfile(userId, guildId);
    const now = new Date();
    const lastDaily = profile.last_daily ? new Date(profile.last_daily) : null;

    if (lastDaily) {
      const hoursSinceLastDaily = (now - lastDaily) / (1000 * 60 * 60);
      if (hoursSinceLastDaily < 20) {
        const hoursRemaining = Math.ceil(20 - hoursSinceLastDaily);
        return { success: false, hoursRemaining };
      }

      const daysSinceLastDaily = (now - lastDaily) / (1000 * 60 * 60 * 24);
      const newStreak = daysSinceLastDaily <= 2 ? profile.daily_streak + 1 : 1;

      const baseReward = 100;
      const streakBonus = Math.min(newStreak * 10, 200);
      const totalReward = baseReward + streakBonus;

      await this.updateProfile(userId, guildId, {
        coins: profile.coins + totalReward,
        daily_streak: newStreak,
        last_daily: now.toISOString(),
      });

      return { success: true, reward: totalReward, streak: newStreak };
    } else {
      const reward = 100;
      await this.updateProfile(userId, guildId, {
        coins: profile.coins + reward,
        daily_streak: 1,
        last_daily: now.toISOString(),
      });

      return { success: true, reward, streak: 1 };
    }
  }

  async createReminder(userId, channelId, guildId, reminderText, remindAt) {
    const { data, error } = await supabase
      .from('reminders')
      .insert({
        user_id: userId,
        channel_id: channelId,
        guild_id: guildId,
        reminder_text: reminderText,
        remind_at: remindAt,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getPendingReminders() {
    const { data, error } = await supabase
      .from('reminders')
      .select('*')
      .eq('completed', false)
      .lte('remind_at', new Date().toISOString())
      .order('remind_at', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async markReminderComplete(reminderId) {
    const { error } = await supabase
      .from('reminders')
      .update({ completed: true })
      .eq('id', reminderId);

    if (error) throw error;
  }

  async getUserReminders(userId) {
    const { data, error } = await supabase
      .from('reminders')
      .select('*')
      .eq('user_id', userId)
      .eq('completed', false)
      .order('remind_at', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async deleteReminder(reminderId, userId) {
    const { error } = await supabase
      .from('reminders')
      .delete()
      .eq('id', reminderId)
      .eq('user_id', userId);

    if (error) throw error;
  }

  async trackDMConversation(userId, username) {
    const { data: existing } = await supabase
      .from('dm_conversations')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (existing) {
      const { data, error } = await supabase
        .from('dm_conversations')
        .update({
          username,
          last_message_at: new Date().toISOString(),
          message_count: existing.message_count + 1,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      return { data, isNew: false };
    } else {
      const { data, error } = await supabase
        .from('dm_conversations')
        .insert({
          user_id: userId,
          username,
        })
        .select()
        .single();

      if (error) throw error;
      return { data, isNew: true };
    }
  }

  async getDMStats() {
    const { data, error } = await supabase
      .from('dm_conversations')
      .select('*')
      .order('message_count', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getPrefix(guildId) {
    const { data, error } = await supabase
      .from('guild_settings')
      .select('prefix')
      .eq('guild_id', guildId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching prefix:', error);
      return '!';
    }
    return data?.prefix || '!';
  }

  async updatePrefix(guildId, newPrefix) {
    const { data, error } = await supabase
      .from('guild_settings')
      .upsert({ guild_id: guildId, prefix: newPrefix, updated_at: new Date().toISOString() })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // --- Economy Shop ---

  async getShopItems(guildId) {
    const { data, error } = await supabase
      .from('shop_items')
      .select('*')
      .eq('guild_id', guildId)
      .order('price', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async createShopItem(itemData) {
    const { data, error } = await supabase
      .from('shop_items')
      .insert({
        ...itemData,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateShopItem(itemId, itemData) {
    const { data, error } = await supabase
      .from('shop_items')
      .update({
        ...itemData,
        updated_at: new Date().toISOString()
      })
      .eq('id', itemId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteShopItem(itemId) {
    const { error } = await supabase
      .from('shop_items')
      .delete()
      .eq('id', itemId);

    if (error) throw error;
  }

  async getInventory(userId, guildId) {
    const { data, error } = await supabase
      .from('user_inventory')
      .select(`
        *,
        item:shop_items(*)
      `)
      .eq('user_id', userId)
      .eq('guild_id', guildId);

    if (error) throw error;
    return data || [];
  }

  async buyItem(userId, guildId, itemId) {
    // 1. Get item and profile
    const { data: item, error: itemErr } = await supabase
      .from('shop_items')
      .select('*')
      .eq('id', itemId)
      .single();

    if (itemErr || !item) throw new Error('Item not found');
    if (item.stock === 0) throw new Error('Item out of stock');

    const profile = await this.getOrCreateProfile(userId, guildId);
    if (profile.coins < item.price) throw new Error('Insufficient coins');

    // 2. Transact (Simplified: deduct coins, add item, update stock)
    const { error: deductErr } = await supabase
      .from('user_profiles')
      .update({ coins: profile.coins - item.price })
      .eq('user_id', userId)
      .eq('guild_id', guildId);

    if (deductErr) throw deductErr;

    // 3. Update inventory
    const { data: existing } = await supabase
      .from('user_inventory')
      .select('*')
      .eq('user_id', userId)
      .eq('guild_id', guildId)
      .eq('item_id', itemId)
      .maybeSingle();

    if (existing) {
      await supabase
        .from('user_inventory')
        .update({ quantity: existing.quantity + 1, updated_at: new Date().toISOString() })
        .eq('id', existing.id);
    } else {
      await supabase
        .from('user_inventory')
        .insert({
          user_id: userId,
          guild_id: guildId,
          item_id: itemId,
          quantity: 1
        });
    }

    // 4. Update stock if not infinite
    if (item.stock > 0) {
      await supabase
        .from('shop_items')
        .update({ stock: item.stock - 1, updated_at: new Date().toISOString() })
        .eq('id', itemId);
    }

    return { success: true, item };
  }

  async sellItem(userId, guildId, itemId) {
    const { data: entry, error: invErr } = await supabase
      .from('user_inventory')
      .select('*, item:shop_items(*)')
      .eq('user_id', userId)
      .eq('guild_id', guildId)
      .eq('item_id', itemId)
      .maybeSingle();

    if (invErr || !entry) throw new Error('Item not found in inventory');

    const item = entry.item;
    const refundAmount = Math.floor(item.price * 0.5);

    if (entry.quantity > 1) {
      await supabase
        .from('user_inventory')
        .update({ quantity: entry.quantity - 1, updated_at: new Date().toISOString() })
        .eq('id', entry.id);
    } else {
      await supabase
        .from('user_inventory')
        .delete()
        .eq('id', entry.id);
    }

    await this.addCoins(userId, guildId, refundAmount);
    return { success: true, refundAmount, itemName: item.name };
  }

  async transferCoins(fromUserId, toUserId, guildId, amount) {
    if (amount <= 0) throw new Error('Amount must be positive');

    const fromProfile = await this.getOrCreateProfile(fromUserId, guildId);
    if (fromProfile.coins < amount) throw new Error('Insufficient coins');

    await this.updateProfile(fromUserId, guildId, { coins: fromProfile.coins - amount });
    await this.addCoins(toUserId, guildId, amount);

    return { success: true };
  }

  // --- Invite Logger System ---
  async getInviteSettings(guildId) {
    const { data, error } = await supabase
      .from('invite_settings')
      .select('*')
      .eq('guild_id', guildId)
      .maybeSingle();

    if (error) throw error;
    if (!data) {
      // Create default settings if not exists
      const { data: newData, error: createErr } = await supabase
        .from('invite_settings')
        .insert({ guild_id: guildId })
        .select()
        .single();
      if (createErr) throw createErr;
      return newData;
    }
    return data;
  }

  async updateInviteSettings(guildId, settings) {
    const { data, error } = await supabase
      .from('invite_settings')
      .upsert({ guild_id: guildId, ...settings, updated_at: new Date().toISOString() })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async recordMemberJoin(guildId, userId, inviterId, code) {
    // 1. Record in history
    await supabase.from('invite_member_history').upsert({
      guild_id: guildId,
      user_id: userId,
      inviter_id: inviterId,
      code: code,
      joined_at: new Date().toISOString()
    });

    // 2. Increment inviter regular count
    if (inviterId) {
      const { data: current } = await supabase
        .from('user_invites')
        .select('regular')
        .eq('guild_id', guildId)
        .eq('user_id', inviterId)
        .maybeSingle();

      const regular = (current?.regular || 0) + 1;
      await supabase.from('user_invites').upsert({
        guild_id: guildId,
        user_id: inviterId,
        regular: regular,
        updated_at: new Date().toISOString()
      }, { onConflict: 'guild_id, user_id' });
    }
  }

  async recordMemberLeave(guildId, userId) {
    // 1. Find who invited this user
    const { data: history } = await supabase
      .from('invite_member_history')
      .select('inviter_id')
      .eq('guild_id', guildId)
      .eq('user_id', userId)
      .maybeSingle();

    if (history?.inviter_id) {
      // 2. Increment leaves count for inviter
      const { data: current } = await supabase
        .from('user_invites')
        .select('leaves')
        .eq('guild_id', guildId)
        .eq('user_id', history.inviter_id)
        .maybeSingle();

      const leaves = (current?.leaves || 0) + 1;
      await supabase.from('user_invites').upsert({
        guild_id: guildId,
        user_id: history.inviter_id,
        leaves: leaves,
        updated_at: new Date().toISOString()
      }, { onConflict: 'guild_id, user_id' });
    }
  }

  async getUserInvites(userId, guildId) {
    const { data, error } = await supabase
      .from('user_invites')
      .select('*')
      .eq('guild_id', guildId)
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;
    return data || { regular: 0, fake: 0, leaves: 0, bonus: 0 };
  }

  async getInviteHistory(userId, guildId) {
    const { data, error } = await supabase
      .from('invite_member_history')
      .select('*')
      .eq('guild_id', guildId)
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  // --- AI & Creative Suite ---

  async getAIModSettings(guildId) {
    const { data, error } = await supabase
      .from('ai_mod_settings')
      .select('*')
      .eq('guild_id', guildId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data || { enabled: false, sensitivity: 5, action_type: 'flag', ignored_channels: [], ignored_roles: [] };
  }

  async updateAIModSettings(guildId, settings) {
    const { data, error } = await supabase
      .from('ai_mod_settings')
      .upsert({ guild_id: guildId, ...settings, updated_at: new Date().toISOString() })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async logAIAction(guildId, userId, channelId, content, reasoning, score, action) {
    const { error } = await supabase
      .from('ai_mod_logs')
      .insert({
        guild_id: guildId,
        user_id: userId,
        channel_id: channelId,
        content: content,
        ai_reasoning: reasoning,
        ai_score: score,
        action_taken: action
      });

    if (error) console.error('[Database] Failed to log AI action:', error);
  }

  async getAIModLogs(guildId, limit = 50) {
    const { data, error } = await supabase
      .from('ai_mod_logs')
      .select('*')
      .eq('guild_id', guildId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  // --- Engagement & Growth Suite ---

  // Analytics
  // Analytics
  async aggregateDailyAnalytics(guildId, memberCount) {
    const today = new Date().toISOString().split('T')[0];
    const startDate = `${today}T00:00:00.000Z`;
    const endDate = `${today}T23:59:59.999Z`;

    // 1. Sum message count from message_activity
    const { data: msgData, error: msgError } = await supabase
      .from('message_activity')
      .select('message_count')
      .eq('guild_id', guildId)
      .gte('activity_hour', startDate)
      .lte('activity_hour', endDate);

    const dayMessageCount = msgData ? msgData.reduce((acc, curr) => acc + curr.message_count, 0) : 0;

    // 2. Sum voice minutes from voice_sessions
    const { data: voiceData, error: voiceError } = await supabase
      .from('voice_sessions')
      .select('duration_minutes')
      .eq('guild_id', guildId)
      .gte('joined_at', startDate)
      .lte('joined_at', endDate);

    const dayVoiceMinutes = voiceData ? voiceData.reduce((acc, curr) => acc + (curr.duration_minutes || 0), 0) : 0;

    // 3. Upsert snapshot
    await this.recordDailySnapshot(guildId, memberCount, dayMessageCount, dayVoiceMinutes);
    return { dayMessageCount, dayVoiceMinutes };
  }

  async recordDailySnapshot(guildId, memberCount, messageCount, voiceMinutes) {
    const today = new Date().toISOString().split('T')[0];
    const { error } = await supabase
      .from('analytics_snapshots')
      .upsert({
        guild_id: guildId,
        snapshot_date: today,
        member_count: memberCount,
        message_count: messageCount,
        voice_minutes: voiceMinutes
      }, { onConflict: 'guild_id,snapshot_date' });

    if (error) console.error('[Analytics] Snapshot error:', error);
  }

  async getAnalyticsData(guildId, days = 30) {
    const { data, error } = await supabase
      .from('analytics_snapshots')
      .select('*')
      .eq('guild_id', guildId)
      .gte('snapshot_date', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
      .order('snapshot_date', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async incrementMessageActivity(guildId, channelId) {
    const currentHour = new Date();
    currentHour.setMinutes(0, 0, 0, 0);
    const hourIso = currentHour.toISOString();

    // Try to find existing row
    const { data: existing } = await supabase
      .from('message_activity')
      .select('message_count')
      .match({ guild_id: guildId, channel_id: channelId, activity_hour: hourIso })
      .single();

    const newCount = (existing?.message_count || 0) + 1;

    const { error } = await supabase
      .from('message_activity')
      .upsert({
        guild_id: guildId,
        channel_id: channelId,
        activity_hour: hourIso,
        message_count: newCount
      }, { onConflict: 'guild_id,channel_id,activity_hour' });

    if (error) console.error('[Analytics] Message increment error:', error);
  }

  // Voice XP
  async getVoiceXPSettings(guildId) {
    const { data, error } = await supabase
      .from('voice_xp_settings')
      .select('*')
      .eq('guild_id', guildId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data || { enabled: false, xp_per_minute: 1.0, level_multiplier: 100.0, reward_roles: [] };
  }

  async updateVoiceXPSettings(guildId, settings) {
    const { data, error } = await supabase
      .from('voice_xp_settings')
      .upsert({ guild_id: guildId, ...settings, updated_at: new Date().toISOString() })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getOpenVoiceSessions(guildId) {
    const { data, error } = await supabase
      .from('voice_sessions')
      .select('user_id')
      .eq('guild_id', guildId)
      .is('left_at', null);

    if (error) return [];
    return data.map(s => s.user_id);
  }

  async startVoiceSession(userId, guildId, channelId) {
    const { data, error } = await supabase
      .from('voice_sessions')
      .insert({ guild_id: guildId, user_id: userId, channel_id: channelId })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async endVoiceSession(userId, guildId) {
    const { data: session, error: fetchError } = await supabase
      .from('voice_sessions')
      .select('*')
      .eq('guild_id', guildId)
      .eq('user_id', userId)
      .is('left_at', null)
      .order('joined_at', { ascending: false })
      .limit(1)
      .single();

    if (fetchError || !session) return null;

    const now = new Date();
    const durationMs = now - new Date(session.joined_at);
    const duration = durationMs / 60000; // float minutes
    const settings = await this.getVoiceXPSettings(guildId);
    const xpEarned = duration * settings.xp_per_minute;

    await supabase
      .from('voice_sessions')
      .update({ left_at: now.toISOString(), duration_minutes: duration, xp_earned: xpEarned })
      .eq('id', session.id);

    // Update user voice level
    const { data: userLevel } = await supabase
      .from('voice_levels')
      .select('*')
      .eq('guild_id', guildId)
      .eq('user_id', userId)
      .single();

    const newXP = (userLevel?.total_xp || 0) + xpEarned;
    const newLevel = Math.floor(newXP / settings.level_multiplier);

    await supabase
      .from('voice_levels')
      .upsert({
        guild_id: guildId,
        user_id: userId,
        total_xp: newXP,
        level: newLevel,
        total_minutes: (userLevel?.total_minutes || 0) + duration,
        updated_at: now.toISOString()
      }, { onConflict: 'guild_id,user_id' });

    return { xpEarned, newLevel, duration };
  }

  async getVoiceLeaderboard(guildId, limit = 10) {
    const { data, error } = await supabase
      .from('voice_levels')
      .select('*')
      .eq('guild_id', guildId)
      .order('total_xp', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  // Giveaways
  async createGiveaway(guildId, giveawayData) {
    const { data, error } = await supabase
      .from('giveaways')
      .insert({ guild_id: guildId, ...giveawayData })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getActiveGiveaways(guildId) {
    const { data, error } = await supabase
      .from('giveaways')
      .select('*')
      .eq('guild_id', guildId)
      .eq('status', 'active')
      .order('end_time', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async getAllGiveaways(guildId) {
    const { data, error } = await supabase
      .from('giveaways')
      .select('*')
      .eq('guild_id', guildId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async enterGiveaway(giveawayId, userId) {
    const { error } = await supabase
      .from('giveaway_entries')
      .insert({ giveaway_id: giveawayId, user_id: userId });

    if (error) throw error;
  }

  async endGiveaway(giveawayId) {
    const { data: entries, error: entriesError } = await supabase
      .from('giveaway_entries')
      .select('user_id')
      .eq('giveaway_id', giveawayId);

    if (entriesError) throw entriesError;

    const { data: giveaway } = await supabase
      .from('giveaways')
      .select('winners_count')
      .eq('id', giveawayId)
      .single();

    const shuffled = entries.sort(() => 0.5 - Math.random());
    const winners = shuffled.slice(0, giveaway.winners_count).map(e => e.user_id);

    const { error } = await supabase
      .from('giveaways')
      .update({ status: 'ended', winners: winners })
      .eq('id', giveawayId);

    if (error) throw error;
    return winners;
  }

  async checkGiveawayRequirements(userId, guildId, requirements) {
    if (!requirements || Object.keys(requirements).length === 0) return true;

    const profile = await this.getOrCreateProfile(userId, guildId);

    // Level Check
    if (requirements.min_level && profile.level < requirements.min_level) {
      return false;
    }

    // Role check is handled by the bot interaction handler as it requires real-time discord role data
    return true;
  }
}

module.exports = new Database();
