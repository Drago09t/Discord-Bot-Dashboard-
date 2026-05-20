-- Advanced Admin Suite Schema

-- Global Bot Settings (Maintenance Mode, etc)
CREATE TABLE IF NOT EXISTS global_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Global Blacklist for Users and Guilds
CREATE TABLE IF NOT EXISTS global_blacklist (
    target_id TEXT PRIMARY KEY,
    type TEXT NOT NULL CHECK (type IN ('user', 'guild')),
    reason TEXT,
    admin_id TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Premium Vouchers / License Keys
CREATE TABLE IF NOT EXISTS premium_vouchers (
    code TEXT PRIMARY KEY,
    tier INTEGER NOT NULL DEFAULT 1,
    duration_days INTEGER DEFAULT 30, -- 0 for lifetime
    is_used BOOLEAN DEFAULT FALSE,
    used_by_guild TEXT,
    used_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Broadcast History
CREATE TABLE IF NOT EXISTS global_broadcasts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id TEXT NOT NULL,
    message_content TEXT NOT NULL,
    target_type TEXT DEFAULT 'all', -- all, premium, regular
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Guild Join/Leave Logs
CREATE TABLE IF NOT EXISTS bot_guild_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    guild_id TEXT NOT NULL,
    guild_name TEXT,
    action TEXT NOT NULL CHECK (action IN ('join', 'leave')),
    member_count INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Command Usage Logs
CREATE TABLE IF NOT EXISTS bot_command_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    guild_id TEXT,
    user_id TEXT NOT NULL,
    command_name TEXT NOT NULL,
    command_type TEXT NOT NULL CHECK (command_type IN ('prefix', 'slash')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indices for faster auditing
CREATE INDEX IF NOT EXISTS idx_command_logs_user ON bot_command_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_command_logs_guild ON bot_command_logs(guild_id);
CREATE INDEX IF NOT EXISTS idx_guild_logs_action ON bot_guild_logs(action);

-- Enable RLS
ALTER TABLE global_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE global_blacklist ENABLE ROW LEVEL SECURITY;
ALTER TABLE premium_vouchers ENABLE ROW LEVEL SECURITY;
ALTER TABLE global_broadcasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE bot_guild_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE bot_command_logs ENABLE ROW LEVEL SECURITY;

-- Basic Policies (Restrictive defaults or Allow for Bot Service Role)
-- Since the bot uses the service role key, these policies don't strictly block the bot.
-- For dashboard access, these will need adjustment based on user roles.
CREATE POLICY "Allow all to service role" ON global_settings FOR ALL USING (true);
CREATE POLICY "Allow all to service role" ON global_blacklist FOR ALL USING (true);
CREATE POLICY "Allow all to service role" ON premium_vouchers FOR ALL USING (true);
CREATE POLICY "Allow all to service role" ON global_broadcasts FOR ALL USING (true);
CREATE POLICY "Allow all to service role" ON bot_guild_logs FOR ALL USING (true);
CREATE POLICY "Allow all to service role" ON bot_command_logs FOR ALL USING (true);
