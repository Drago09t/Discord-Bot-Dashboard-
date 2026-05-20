const importedDB = require('./supabaseDB');
const { supabase } = importedDB;

console.log('[ChannelDB] Imported supabaseDB:', !!importedDB);
console.log('[ChannelDB] Extracted supabase client:', !!supabase);

class ChannelDB {
  /**
   * Get all AI channels for a guild
   * @param {string} guildId 
   */
  async getChannels(guildId) {
    try {
      const { data, error } = await supabase
        .from('ai_channels')
        .select('*')
        .eq('guild_id', guildId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching AI channels:', error);
      return [];
    }
  }

  /**
   * Add or update an AI channel
   * @param {Object} channelData 
   */
  async addChannel(channelData) {
    if (!channelData) {
      console.error('[ChannelDB] Error: channelData is undefined');
      throw new Error('channelData is required');
    }
    try {
      const { data, error } = await supabase
        .from('ai_channels')
        .upsert({
          guild_id: channelData.guild_id || channelData.guildId,
          channel_id: channelData.channel_id || channelData.channelId,
          personality: channelData.personality || 'Default AI',
          system_prompt: channelData.system_prompt || channelData.systemPrompt || '',
          reply_chance: channelData.reply_chance ?? channelData.replyChance ?? 0.0,
          context_length: channelData.context_length ?? channelData.contextLength ?? 10,
          enabled: channelData.enabled ?? true
        }, { onConflict: 'guild_id, channel_id' })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error adding AI channel:', error);
      throw error;
    }
  }

  /**
   * Remove an AI channel
   * @param {string} channelId 
   * @param {string} guildId
   */
  async removeChannel(channelId, guildId) {
    try {
      const { error } = await supabase
        .from('ai_channels')
        .delete()
        .eq('channel_id', channelId)
        .eq('guild_id', guildId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error removing AI channel:', error);
      return false;
    }
  }

  /**
   * Check if a channel is an enabled AI channel
   * @param {string} channelId 
   */
  async isAIChannel(channelId) {
    try {
      const { data, error } = await supabase
        .from('ai_channels')
        .select('enabled')
        .eq('channel_id', channelId)
        .eq('enabled', true)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return !!data;
    } catch (error) {
      // console.error('Error checking AI channel:', error);
      return false;
    }
  }

  /**
   * Get configuration for a specific channel
   * @param {string} channelId 
   */
  async getChannelConfig(channelId) {
    try {
      const { data, error } = await supabase
        .from('ai_channels')
        .select('*')
        .eq('channel_id', channelId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }
      return data;
    } catch (error) {
      console.error('Error getting channel config:', error);
      return null;
    }
  }
}

module.exports = new ChannelDB();
