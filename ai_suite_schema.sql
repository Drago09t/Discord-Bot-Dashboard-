-- 16. AI & Creative Suite System

-- Table for AI Moderation settings
CREATE TABLE IF NOT EXISTS ai_mod_settings (
    guild_id TEXT PRIMARY KEY,
    enabled BOOLEAN DEFAULT FALSE,
    sensitivity INTEGER DEFAULT 5, -- 1 to 10 scale
    action_type TEXT DEFAULT 'flag', -- 'warn', 'mute', 'flag' (just log), 'delete'
    ignored_channels TEXT[] DEFAULT '{}',
    ignored_roles TEXT[] DEFAULT '{}',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table for AI Moderation logs/history
CREATE TABLE IF NOT EXISTS ai_mod_logs (
    id BIGSERIAL PRIMARY KEY,
    guild_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    channel_id TEXT,
    content TEXT,
    ai_reasoning TEXT,
    ai_score FLOAT, -- Toxicity score or similar
    action_taken TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_ai_mod_logs_guild ON ai_mod_logs(guild_id);
CREATE INDEX IF NOT EXISTS idx_ai_mod_logs_user ON ai_mod_logs(user_id, guild_id);

-- Enable RLS
ALTER TABLE ai_mod_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_mod_logs ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Allow public access to ai_mod_settings" ON ai_mod_settings;
CREATE POLICY "Allow public access to ai_mod_settings" ON ai_mod_settings FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow public access to ai_mod_logs" ON ai_mod_logs;
CREATE POLICY "Allow public access to ai_mod_logs" ON ai_mod_logs FOR ALL USING (true);
