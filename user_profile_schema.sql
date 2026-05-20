-- ============================================
-- USER PROFILES & GLOBAL IDENTITIES
-- ============================================

CREATE TABLE IF NOT EXISTS user_profiles (
    user_id TEXT PRIMARY KEY,
    bio TEXT DEFAULT 'No bio set.',
    background_url TEXT,
    theme_color TEXT DEFAULT '#6366f1',
    twitter_url TEXT,
    twitch_url TEXT,
    youtube_url TEXT,
    website_url TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ACTIVITY TRACKING & RANKINGS
-- ============================================

-- Track message counts per user/channel
CREATE TABLE IF NOT EXISTS activity_tracking (
    id BIGSERIAL PRIMARY KEY,
    guild_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    channel_id TEXT NOT NULL,
    message_count INTEGER DEFAULT 0,
    last_message_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(guild_id, user_id, channel_id)
);

-- Global User Rankings (XP/Levels aggregated or source of truth)
CREATE TABLE IF NOT EXISTS user_rankings (
    id BIGSERIAL PRIMARY KEY,
    user_id TEXT NOT NULL,
    guild_id TEXT, -- Optional if we want global vs per-guild
    xp FLOAT DEFAULT 0,
    level INTEGER DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, guild_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_activity_tracking_user ON activity_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_tracking_guild_user ON activity_tracking(guild_id, user_id);
CREATE INDEX IF NOT EXISTS idx_user_rankings_user ON user_rankings(user_id);

-- RLS Policies
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_rankings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public access to user_profiles" ON user_profiles;
CREATE POLICY "Allow public access to user_profiles" ON user_profiles FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow public access to activity_tracking" ON activity_tracking;
CREATE POLICY "Allow public access to activity_tracking" ON activity_tracking FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow public access to user_rankings" ON user_rankings;
CREATE POLICY "Allow public access to user_rankings" ON user_rankings FOR ALL USING (true);
