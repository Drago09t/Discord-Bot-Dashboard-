-- 17. Engagement & Growth Suite

-- ============================================
-- VISUAL ANALYTICS PRO
-- ============================================

-- Daily analytics snapshots
CREATE TABLE IF NOT EXISTS analytics_snapshots (
    id BIGSERIAL PRIMARY KEY,
    guild_id TEXT NOT NULL,
    snapshot_date DATE NOT NULL,
    member_count INTEGER DEFAULT 0,
    message_count INTEGER DEFAULT 0,
    voice_minutes INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(guild_id, snapshot_date)
);

-- Hourly message activity for heatmaps
CREATE TABLE IF NOT EXISTS message_activity (
    id BIGSERIAL PRIMARY KEY,
    guild_id TEXT NOT NULL,
    channel_id TEXT,
    activity_hour TIMESTAMPTZ NOT NULL,
    message_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(guild_id, channel_id, activity_hour)
);

-- ============================================
-- VOICE XP & REWARDS
-- ============================================

-- Voice XP settings per guild
CREATE TABLE IF NOT EXISTS voice_xp_settings (
    guild_id TEXT PRIMARY KEY,
    enabled BOOLEAN DEFAULT FALSE,
    xp_per_minute FLOAT DEFAULT 1.0,
    level_multiplier FLOAT DEFAULT 100.0,
    reward_roles JSONB DEFAULT '[]', -- [{ level: 5, role_id: "123" }]
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Voice sessions tracking
CREATE TABLE IF NOT EXISTS voice_sessions (
    id BIGSERIAL PRIMARY KEY,
    guild_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    channel_id TEXT NOT NULL,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    left_at TIMESTAMPTZ,
    duration_minutes INTEGER DEFAULT 0,
    xp_earned FLOAT DEFAULT 0
);

-- Voice levels and XP
CREATE TABLE IF NOT EXISTS voice_levels (
    id BIGSERIAL PRIMARY KEY,
    guild_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    total_xp FLOAT DEFAULT 0,
    level INTEGER DEFAULT 0,
    total_minutes INTEGER DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(guild_id, user_id)
);

-- ============================================
-- ADVANCED GIVEAWAY MANAGER
-- ============================================

-- Giveaways
CREATE TABLE IF NOT EXISTS giveaways (
    id BIGSERIAL PRIMARY KEY,
    guild_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    prize TEXT NOT NULL,
    winners_count INTEGER DEFAULT 1,
    end_time TIMESTAMPTZ NOT NULL,
    requirements JSONB DEFAULT '{}', -- { min_level: 5, required_roles: ["123"] }
    created_by TEXT NOT NULL,
    status TEXT DEFAULT 'active', -- 'active', 'ended'
    winners JSONB DEFAULT '[]', -- ["user_id1", "user_id2"]
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Giveaway entries
CREATE TABLE IF NOT EXISTS giveaway_entries (
    id BIGSERIAL PRIMARY KEY,
    giveaway_id BIGINT NOT NULL REFERENCES giveaways(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,
    entered_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(giveaway_id, user_id)
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_analytics_snapshots_guild ON analytics_snapshots(guild_id, snapshot_date DESC);
CREATE INDEX IF NOT EXISTS idx_message_activity_guild ON message_activity(guild_id, activity_hour DESC);
CREATE INDEX IF NOT EXISTS idx_voice_sessions_user ON voice_sessions(guild_id, user_id);
CREATE INDEX IF NOT EXISTS idx_voice_levels_guild ON voice_levels(guild_id, total_xp DESC);
CREATE INDEX IF NOT EXISTS idx_giveaways_guild ON giveaways(guild_id, status);
CREATE INDEX IF NOT EXISTS idx_giveaway_entries_giveaway ON giveaway_entries(giveaway_id);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE analytics_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_xp_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE giveaways ENABLE ROW LEVEL SECURITY;
ALTER TABLE giveaway_entries ENABLE ROW LEVEL SECURITY;

-- ============================================
-- POLICIES
-- ============================================

DROP POLICY IF EXISTS "Allow public access to analytics_snapshots" ON analytics_snapshots;
CREATE POLICY "Allow public access to analytics_snapshots" ON analytics_snapshots FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow public access to message_activity" ON message_activity;
CREATE POLICY "Allow public access to message_activity" ON message_activity FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow public access to voice_xp_settings" ON voice_xp_settings;
CREATE POLICY "Allow public access to voice_xp_settings" ON voice_xp_settings FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow public access to voice_sessions" ON voice_sessions;
CREATE POLICY "Allow public access to voice_sessions" ON voice_sessions FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow public access to voice_levels" ON voice_levels;
CREATE POLICY "Allow public access to voice_levels" ON voice_levels FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow public access to giveaways" ON giveaways;
CREATE POLICY "Allow public access to giveaways" ON giveaways FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow public access to giveaway_entries" ON giveaway_entries;
CREATE POLICY "Allow public access to giveaway_entries" ON giveaway_entries FOR ALL USING (true);
