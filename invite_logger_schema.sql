-- 15. Invite Logger System

-- Table for invite settings per guild
CREATE TABLE IF NOT EXISTS invite_settings (
    guild_id TEXT PRIMARY KEY,
    logs_channel_id TEXT,
    count_channel_id TEXT,
    status_channel_id TEXT,
    status_text_channel_id TEXT,
    join_message TEXT DEFAULT '{user} joined using invite code {code} from {inviter}. Total invites: {total}',
    leave_message TEXT DEFAULT '{user} left. They were invited by {inviter}.',
    enabled BOOLEAN DEFAULT TRUE,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table for tracking individual user invite stats
CREATE TABLE IF NOT EXISTS user_invites (
    id BIGSERIAL PRIMARY KEY,
    guild_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    inviter_id TEXT,
    code TEXT,
    regular INTEGER DEFAULT 0,
    fake INTEGER DEFAULT 0,
    leaves INTEGER DEFAULT 0,
    bonus INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(guild_id, user_id)
);

-- Table for member history (to detect which invite was used)
CREATE TABLE IF NOT EXISTS invite_member_history (
    id BIGSERIAL PRIMARY KEY,
    guild_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    inviter_id TEXT,
    code TEXT,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(guild_id, user_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_invites_guild ON user_invites(guild_id);
CREATE INDEX IF NOT EXISTS idx_invite_settings_guild ON invite_settings(guild_id);

-- Enable RLS
ALTER TABLE invite_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE invite_member_history ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Allow public access to invite_settings" ON invite_settings;
CREATE POLICY "Allow public access to invite_settings" ON invite_settings FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow public access to user_invites" ON user_invites;
CREATE POLICY "Allow public access to user_invites" ON user_invites FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow public access to invite_member_history" ON invite_member_history;
CREATE POLICY "Allow public access to invite_member_history" ON invite_member_history FOR ALL USING (true);
