-- ENHANCED ECONOMY MIGRATION
-- This script ensures ALL columns exist in the user_profiles table.

DO $$ 
BEGIN
    -- 1. Check if user_profiles exists
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_profiles') THEN
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
    ELSE
        -- 2. Safely add missing columns to existing table
        ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS user_id TEXT;
        ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS guild_id TEXT;
        ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS username TEXT;
        ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS coins BIGINT DEFAULT 100;
        ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS xp BIGINT DEFAULT 0;
        ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1;
        ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS total_messages BIGINT DEFAULT 0;
        ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS daily_streak INTEGER DEFAULT 0;
        ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS last_daily TIMESTAMPTZ;
        ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
        ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

        -- 3. Try to add unique constraint if missing
        BEGIN
            ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_guild_id_user_id_key UNIQUE (guild_id, user_id);
        EXCEPTION WHEN duplicate_table THEN 
            RAISE NOTICE 'Constraint already exists';
        WHEN others THEN
            RAISE NOTICE 'Constraint error: %', SQLERRM;
        END;
    END IF;
END $$;

-- 4. Re-sync indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_guild_coins ON user_profiles(guild_id, coins DESC);
CREATE INDEX IF NOT EXISTS idx_user_profiles_user ON user_profiles(user_id);

-- 5. Ensure Shop & Inventory exist
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

-- 6. Enable RLS and Policies (Safe to run multiple times)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_inventory ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public access to user_profiles" ON user_profiles;
CREATE POLICY "Allow public access to user_profiles" ON user_profiles FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow public access to shop_items" ON shop_items;
CREATE POLICY "Allow public access to shop_items" ON shop_items FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow public access to user_inventory" ON user_inventory;
CREATE POLICY "Allow public access to user_inventory" ON user_inventory FOR ALL USING (true);
