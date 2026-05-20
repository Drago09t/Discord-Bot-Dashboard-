-- 14. Economy Shop System

-- Table for shop items
CREATE TABLE IF NOT EXISTS shop_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    guild_id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    price BIGINT NOT NULL DEFAULT 0,
    role_id TEXT, -- Discord Role ID to give upon purchase (optional)
    stock INTEGER DEFAULT -1, -- -1 for infinite
    image_url TEXT,
    icon TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(guild_id, name)
);

CREATE INDEX IF NOT EXISTS idx_shop_items_guild ON shop_items(guild_id);

-- Table for user inventory
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

CREATE INDEX IF NOT EXISTS idx_inventory_user_guild ON user_inventory(user_id, guild_id);

-- Enable RLS
ALTER TABLE shop_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_inventory ENABLE ROW LEVEL SECURITY;

-- Policies (Simplified for development)
CREATE POLICY "Allow public access to shop_items" ON shop_items FOR ALL USING (true);
CREATE POLICY "Allow public access to user_inventory" ON user_inventory FOR ALL USING (true);
