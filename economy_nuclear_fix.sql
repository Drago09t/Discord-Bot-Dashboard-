-- 🚨 NUCLEAR ECONOMY FIX (v2 - Fixed Index conflicts)
-- This script will RENAME old tables to backups and create a clean, perfect schema.
-- This solves "column does not exist" and "duplicate key" errors.

BEGIN;

-- 1. Backup old table and handle indexes
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_profiles') THEN
        -- Drop indexes associated with the old name to prevent naming conflicts
        DROP INDEX IF EXISTS idx_user_profiles_guild_coins;
        DROP INDEX IF EXISTS idx_user_profiles_guild_xp;
        DROP INDEX IF EXISTS idx_user_profiles_user;
        
        ALTER TABLE user_profiles RENAME TO user_profiles_backup;
    END IF;
END $$;

-- 2. Create the PERFECT user_profiles table
CREATE TABLE user_profiles (
    id BIGSERIAL PRIMARY KEY,
    user_id TEXT NOT NULL,
    guild_id TEXT NOT NULL,
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

-- 3. Restore data from backup if possible
DO $$
BEGIN
    INSERT INTO user_profiles (user_id, guild_id, username, coins, xp, level, total_messages)
    SELECT user_id, guild_id, username, 
           COALESCE(coins, 100), 
           COALESCE(xp, 0), 
           COALESCE(level, 1), 
           COALESCE(total_messages, 0)
    FROM user_profiles_backup
    ON CONFLICT (guild_id, user_id) DO NOTHING;
EXCEPTION WHEN others THEN
    RAISE NOTICE 'Could not restore backup data, starting fresh.';
END $$;

-- 4. Create proper indexes (With safest check)
CREATE INDEX IF NOT EXISTS idx_user_profiles_guild_coins_new ON user_profiles(guild_id, coins DESC);
CREATE INDEX IF NOT EXISTS idx_user_profiles_guild_xp_new ON user_profiles(guild_id, xp DESC);
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_new ON user_profiles(user_id);

-- 5. Fix Shop & Inventory tables (they are usually fine, but let's be sure)
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

-- 6. Enable RLS and Policies
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_inventory ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public access to user_profiles" ON user_profiles;
CREATE POLICY "Allow public access to user_profiles" ON user_profiles FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow public access to shop_items" ON shop_items;
CREATE POLICY "Allow public access to shop_items" ON shop_items FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow public access to user_inventory" ON user_inventory;
CREATE POLICY "Allow public access to user_inventory" ON user_inventory FOR ALL USING (true);

COMMIT;
