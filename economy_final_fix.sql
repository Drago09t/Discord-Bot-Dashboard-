-- 🚨 DEFINITIVE ECONOMY & RANKING FIX
-- This script wipes the old conflicting tables and creates a single, unified system.
-- WARNING: This will reset user balances/XP to ensure a clean state.

BEGIN;

-- 1. Drop the old conflicting tables
DROP TABLE IF EXISTS user_rankings CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;

-- 2. Create the unified user_profiles table
CREATE TABLE user_profiles (
    id BIGSERIAL PRIMARY KEY,
    guild_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    username TEXT,
    coins BIGINT DEFAULT 100,
    xp BIGINT DEFAULT 0,
    level INTEGER DEFAULT 1,
    total_messages BIGINT DEFAULT 0,
    daily_streak INTEGER DEFAULT 0,
    last_daily TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(guild_id, user_id)
);

-- 3. Create indexes for performance
CREATE INDEX idx_user_profiles_guild_coins_top ON user_profiles(guild_id, coins DESC);
CREATE INDEX idx_user_profiles_guild_xp_top ON user_profiles(guild_id, xp DESC);
CREATE INDEX idx_user_profiles_search ON user_profiles(user_id, guild_id);

-- 4. Re-ensure Shop Items & Inventory exist (with clean structure)
CREATE TABLE IF NOT EXISTS shop_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    guild_id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    price BIGINT NOT NULL DEFAULT 0,
    role_id TEXT,
    stock INTEGER DEFAULT -1,
    image_url TEXT,
    icon TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(guild_id, name)
);

CREATE TABLE IF NOT EXISTS user_inventory (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,
    guild_id TEXT NOT NULL,
    item_id UUID REFERENCES shop_items(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, guild_id, item_id)
);

-- 5. Enable RLS and Policies
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_inventory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public Access User Profiles" ON user_profiles FOR ALL USING (true);
CREATE POLICY "Public Access Shop Items" ON shop_items FOR ALL USING (true);
CREATE POLICY "Public Access User Inventory" ON user_inventory FOR ALL USING (true);

-- 6. Grant sequence permissions (just in case)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;

COMMIT;

-- Force schema cache refresh
NOTIFY pgrst, 'reload schema';
