-- Add channel_id and message_id to giveaways table to support bot integration
ALTER TABLE giveaways 
ADD COLUMN IF NOT EXISTS channel_id TEXT,
ADD COLUMN IF NOT EXISTS message_id TEXT;
