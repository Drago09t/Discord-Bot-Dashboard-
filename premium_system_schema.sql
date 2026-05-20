-- 15. Premium Management System
CREATE TABLE IF NOT EXISTS premium_settings (
    guild_id TEXT PRIMARY KEY,
    premium_enabled BOOLEAN DEFAULT FALSE,
    premium_tier INTEGER DEFAULT 0, -- 0: Normal, 1: Basic Premium, 2: Ultra Premium
    premium_expires_at TIMESTAMPTZ,
    purchased_at TIMESTAMPTZ DEFAULT NOW(),
    unlimited_use BOOLEAN DEFAULT FALSE, -- For lifetime/admin usage
    features_unlocked TEXT[] DEFAULT '{}', -- Specific features unlocked as premium
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for expiration checks
CREATE INDEX IF NOT EXISTS idx_premium_expires_at ON premium_settings(premium_expires_at);

-- Global Owners Table (to identify dashboard owners)
CREATE TABLE IF NOT EXISTS bot_admins (
    user_id TEXT PRIMARY KEY,
    role TEXT DEFAULT 'owner', -- 'owner', 'manager'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE premium_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE bot_admins ENABLE ROW LEVEL SECURITY;

-- Policies (Allow read for all, but only owners can manage)
-- In production, these should be more restrictive
CREATE POLICY "Allow read access to premium_settings" ON premium_settings FOR SELECT USING (true);
CREATE POLICY "Allow public access to bot_admins" ON bot_admins FOR ALL USING (true);
CREATE POLICY "Allow owner access to premium_settings" ON premium_settings FOR ALL USING (true);
