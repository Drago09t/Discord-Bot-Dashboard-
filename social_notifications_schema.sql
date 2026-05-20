-- 14. Social Notifications (YouTube & Twitch)
CREATE TABLE IF NOT EXISTS social_notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    guild_id TEXT NOT NULL,
    platform TEXT NOT NULL, -- 'youtube' or 'twitch'
    channel_id TEXT NOT NULL, -- YouTube Channel ID or Twitch Username/ID
    channel_name TEXT, -- Display name
    notification_channel_id TEXT NOT NULL, -- Discord channel where alert is sent
    message TEXT DEFAULT '{author} is now live on {platform}! {url}',
    enabled BOOLEAN DEFAULT TRUE,
    last_content_id TEXT, -- Video ID or Stream start time
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(guild_id, platform, channel_id)
);

CREATE INDEX IF NOT EXISTS idx_social_notifications_guild ON social_notifications(guild_id);
CREATE INDEX IF NOT EXISTS idx_social_notifications_platform ON social_notifications(platform);

-- Enable RLS
ALTER TABLE social_notifications ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Allow public access to social_notifications" ON social_notifications;
CREATE POLICY "Allow public access to social_notifications" ON social_notifications FOR ALL USING (true);
