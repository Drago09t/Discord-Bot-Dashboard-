-- SUPABASE DATABASE SCHEMA FOR DISCORD BOT FEATURES

-- 1. Guild Settings (Consolidated for better performance)
CREATE TABLE IF NOT EXISTS guild_settings (
    guild_id TEXT PRIMARY KEY,
    
    -- Welcome Settings
    welcome_enabled BOOLEAN DEFAULT FALSE,
    welcome_channel_id TEXT,
    welcome_message TEXT DEFAULT 'Welcome {user} to {server}!',
    
    -- Goodbye Settings
    goodbye_enabled BOOLEAN DEFAULT FALSE,
    goodbye_channel_id TEXT,
    goodbye_message TEXT DEFAULT 'Goodbye {user}, we will miss you!',
    
    -- Logging Settings
    logging_enabled BOOLEAN DEFAULT FALSE,
    logging_channel_id TEXT,
    
    -- Auto-Mod General Toggle
    automod_enabled BOOLEAN DEFAULT FALSE,
    automod_spam_threshold INTEGER DEFAULT 5,
    automod_caps_threshold INTEGER DEFAULT 70,
    automod_invites_blocked BOOLEAN DEFAULT FALSE,
    
    -- Anti-Raid Settings
    raid_protection_enabled BOOLEAN DEFAULT FALSE,
    raid_max_joins INTEGER DEFAULT 5,
    raid_window_seconds INTEGER DEFAULT 10,
    raid_action TEXT DEFAULT 'kick', -- 'kick' or 'ban'

    -- Advanced Welcome Settings
    welcome_card_enabled BOOLEAN DEFAULT FALSE,
    welcome_background_url TEXT,
    welcome_text_color TEXT DEFAULT '#ffffff',
    welcome_dm_enabled BOOLEAN DEFAULT FALSE,
    welcome_dm_message TEXT DEFAULT 'Welcome to {server}, {user}!',
    
    -- Prefix Settings
    prefix TEXT DEFAULT '!',
    
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Bad Words Filter
CREATE TABLE IF NOT EXISTS bad_words (
    id BIGSERIAL PRIMARY KEY,
    guild_id TEXT REFERENCES guild_settings(guild_id) ON DELETE CASCADE,
    word TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(guild_id, word)
);

-- 3. Auto-Roles
CREATE TABLE IF NOT EXISTS auto_roles (
    id BIGSERIAL PRIMARY KEY,
    guild_id TEXT REFERENCES guild_settings(guild_id) ON DELETE CASCADE,
    role_id TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(guild_id, role_id)
);

-- 4. Auto-Reactions
CREATE TABLE IF NOT EXISTS auto_reactions (
    id BIGSERIAL PRIMARY KEY,
    guild_id TEXT REFERENCES guild_settings(guild_id) ON DELETE CASCADE,
    keyword TEXT NOT NULL,
    emoji TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(guild_id, keyword)
);

-- 5. AFK Status
CREATE TABLE IF NOT EXISTS afk_status (
    user_id TEXT NOT NULL,
    guild_id TEXT NOT NULL,
    message TEXT DEFAULT 'AFK',
    timestamp BIGINT NOT NULL,
    PRIMARY KEY (user_id, guild_id)
);

-- 6. Activity Tracking
CREATE TABLE IF NOT EXISTS activity_tracking (
    id BIGSERIAL PRIMARY KEY,
    guild_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    channel_id TEXT NOT NULL,
    message_count BIGINT DEFAULT 1,
    last_message_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(guild_id, user_id, channel_id)
);

-- Enable RLS (Optional but recommended)
ALTER TABLE guild_settings ENABLE ROW LEVEL SECURITY;

-- Add policies here if needed for direct client access
-- WARNING: These are basic policies for demonstration. For production, restrict to authenticated users or specific guilds.
CREATE POLICY "Allow public read access to guild_settings" ON guild_settings FOR SELECT USING (true);
CREATE POLICY "Allow public insert access to guild_settings" ON guild_settings FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access to guild_settings" ON guild_settings FOR UPDATE USING (true);


-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_activity_guild_user ON activity_tracking(guild_id, user_id);
CREATE INDEX IF NOT EXISTS idx_bad_words_guild ON bad_words(guild_id);
CREATE INDEX IF NOT EXISTS idx_auto_roles_guild ON auto_roles(guild_id);

-- 7. Moderation Settings
CREATE TABLE IF NOT EXISTS moderation_settings (
    guild_id TEXT NOT NULL,
    command_name TEXT NOT NULL,
    enabled BOOLEAN DEFAULT TRUE,
    allowed_roles TEXT[] DEFAULT '{}',
    allowed_channels TEXT[] DEFAULT '{}',
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (guild_id, command_name)
);


CREATE INDEX IF NOT EXISTS idx_moderation_guild ON moderation_settings(guild_id);

-- 8. Advanced Auto Moderation Settings
CREATE TABLE IF NOT EXISTS automod_settings (
    guild_id TEXT PRIMARY KEY,
    enabled BOOLEAN DEFAULT FALSE,
    modules JSONB DEFAULT '{
        "spam": {"enabled": false, "action": "block", "disabledChannels": [], "disabledRoles": []},
        "badWords": {"enabled": false, "action": "block", "disabledChannels": [], "disabledRoles": []},
        "duplicatedText": {"enabled": false, "action": "block", "disabledChannels": [], "disabledRoles": []},
        "repeatedMessages": {"enabled": false, "action": "block", "disabledChannels": [], "disabledRoles": []},
        "discordInvites": {"enabled": false, "action": "block", "disabledChannels": [], "disabledRoles": []},
        "links": {"enabled": false, "action": "block", "disabledChannels": [], "disabledRoles": []},
        "capsSpam": {"enabled": false, "action": "block", "disabledChannels": [], "disabledRoles": []},
        "emojiSpam": {"enabled": false, "action": "block", "disabledChannels": [], "disabledRoles": []},
        "massMention": {"enabled": false, "action": "block", "disabledChannels": [], "disabledRoles": []}
    }'::jsonb,
    ignored_channels TEXT[] DEFAULT '{}',
    ignored_roles TEXT[] DEFAULT '{}',
    only_images_channels TEXT[] DEFAULT '{}',
    only_youtube_channels TEXT[] DEFAULT '{}',
    bad_words_list TEXT[] DEFAULT '{}',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_automod_guild ON automod_settings(guild_id);

-- Enable RLS
ALTER TABLE automod_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access to automod_settings" ON automod_settings;
CREATE POLICY "Allow public read access to automod_settings" ON automod_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert access to automod_settings" ON automod_settings;
CREATE POLICY "Allow public insert access to automod_settings" ON automod_settings FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update access to automod_settings" ON automod_settings;
CREATE POLICY "Allow public update access to automod_settings" ON automod_settings FOR UPDATE USING (true);


-- 9. AI Channels System
CREATE TABLE IF NOT EXISTS ai_channels (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    guild_id TEXT NOT NULL,
    channel_id TEXT NOT NULL,
    personality TEXT DEFAULT 'Default AI',
    system_prompt TEXT,
    reply_chance FLOAT DEFAULT 0.0,
    context_length INTEGER DEFAULT 10,
    enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(guild_id, channel_id)
);

CREATE INDEX IF NOT EXISTS idx_ai_channels_guild ON ai_channels(guild_id);

-- Enable RLS
ALTER TABLE ai_channels ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access to ai_channels" ON ai_channels;
CREATE POLICY "Allow public read access to ai_channels" ON ai_channels FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert access to ai_channels" ON ai_channels;
CREATE POLICY "Allow public insert access to ai_channels" ON ai_channels FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update access to ai_channels" ON ai_channels;
CREATE POLICY "Allow public update access to ai_channels" ON ai_channels FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow public delete access to ai_channels" ON ai_channels;
CREATE POLICY "Allow public delete access to ai_channels" ON ai_channels FOR DELETE USING (true);
-- 10. User Rankings (XP System)
CREATE TABLE IF NOT EXISTS user_rankings (
    id BIGSERIAL PRIMARY KEY,
    guild_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    username TEXT,
    xp BIGINT DEFAULT 0,
    level INTEGER DEFAULT 1,
    total_messages BIGINT DEFAULT 0,
    last_xp_time TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(guild_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_user_rankings_guild_xp ON user_rankings(guild_id, xp DESC);
CREATE INDEX IF NOT EXISTS idx_user_rankings_user ON user_rankings(user_id);

-- Enable RLS
ALTER TABLE user_rankings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access to user_rankings" ON user_rankings;
CREATE POLICY "Allow public read access to user_rankings" ON user_rankings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert access to user_rankings" ON user_rankings;
CREATE POLICY "Allow public insert access to user_rankings" ON user_rankings FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update access to user_rankings" ON user_rankings;
CREATE POLICY "Allow public update access to user_rankings" ON user_rankings FOR UPDATE USING (true);


-- 11. Reaction Roles
CREATE TABLE IF NOT EXISTS reaction_roles (
    id BIGSERIAL PRIMARY KEY,
    guild_id TEXT NOT NULL,
    message_id TEXT NOT NULL,
    emoji TEXT NOT NULL,
    role_id TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(guild_id, message_id, emoji)
);

CREATE INDEX IF NOT EXISTS idx_reaction_roles_guild ON reaction_roles(guild_id);
CREATE INDEX IF NOT EXISTS idx_reaction_roles_message ON reaction_roles(message_id);

-- Enable RLS
ALTER TABLE reaction_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access to reaction_roles" ON reaction_roles;
CREATE POLICY "Allow public read access to reaction_roles" ON reaction_roles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert access to reaction_roles" ON reaction_roles;
CREATE POLICY "Allow public insert access to reaction_roles" ON reaction_roles FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update access to reaction_roles" ON reaction_roles;
CREATE POLICY "Allow public update access to reaction_roles" ON reaction_roles FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow public delete access to reaction_roles" ON reaction_roles;
CREATE POLICY "Allow public delete access to reaction_roles" ON reaction_roles FOR DELETE USING (true);

-- 12. Ticket System
-- Global settings for tickets per guild
CREATE TABLE IF NOT EXISTS ticket_settings (
    guild_id TEXT PRIMARY KEY,
    enabled BOOLEAN DEFAULT FALSE,
    log_channel_id TEXT,
    transcript_channel_id TEXT,
    limit_per_user INTEGER DEFAULT 1,
    category_id TEXT, -- Default category if not specified in panel
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ticket Panels (Types of tickets)
CREATE TABLE IF NOT EXISTS ticket_panels (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    guild_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    button_text TEXT DEFAULT 'Create Ticket',
    button_emoji TEXT DEFAULT '🎫',
    button_style TEXT DEFAULT 'PRIMARY', -- PRIMARY, SECONDARY, SUCCESS, DANGER
    support_role_id TEXT,
    category_id TEXT,
    welcome_message TEXT DEFAULT 'Hello {user}, support will be with you shortly.',
    naming_scheme TEXT DEFAULT 'ticket-{user}', -- ticket-{user}, ticket-{id}
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(guild_id, title)
);

-- Active Tickets
CREATE TABLE IF NOT EXISTS active_tickets (
    id BIGSERIAL PRIMARY KEY,
    guild_id TEXT NOT NULL,
    channel_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    panel_id UUID REFERENCES ticket_panels(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'open', -- open, closed
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(guild_id, channel_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_ticket_panels_guild ON ticket_panels(guild_id);
CREATE INDEX IF NOT EXISTS idx_active_tickets_guild_user ON active_tickets(guild_id, user_id);
CREATE INDEX IF NOT EXISTS idx_active_tickets_channel ON active_tickets(channel_id);

-- RLS
ALTER TABLE ticket_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_panels ENABLE ROW LEVEL SECURITY;
ALTER TABLE active_tickets ENABLE ROW LEVEL SECURITY;

-- Policies (Simplified for demo)
CREATE POLICY "Allow public access to ticket_settings" ON ticket_settings FOR ALL USING (true);
CREATE POLICY "Allow public access to ticket_panels" ON ticket_panels FOR ALL USING (true);
CREATE POLICY "Allow public access to active_tickets" ON active_tickets FOR ALL USING (true);

-- 13. Embed Templates
CREATE TABLE IF NOT EXISTS embed_templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    guild_id TEXT NOT NULL,
    name TEXT NOT NULL,
    content JSONB NOT NULL,
    buttons JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(guild_id, name)
);

CREATE INDEX IF NOT EXISTS idx_embed_templates_guild ON embed_templates(guild_id);

-- Enable RLS
ALTER TABLE embed_templates ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Allow public access to embed_templates" ON embed_templates FOR ALL USING (true);
