const { EmbedBuilder } = require('discord.js');
const database = require('../supabaseDB');
const https = require('node:https');

class SocialNotifications {
    constructor(client) {
        this.client = client;
        this.interval = 5 * 60 * 1000; // 5 minutes
        this.init();
    }

    async init() {
        console.log('[Social] Initializing social notification system...');
        this.checkLoop();
        setInterval(() => this.checkLoop(), this.interval);
    }

    async checkLoop() {
        try {
            const notifications = await database.getAllSocialNotifications();
            for (const notify of notifications) {
                if (notify.platform === 'youtube') {
                    await this.checkYouTube(notify);
                } else if (notify.platform === 'twitch') {
                    await this.checkTwitch(notify);
                }
            }
        } catch (error) {
            console.error('[Social] Error in check loop:', error);
        }
    }

    async checkYouTube(notify) {
        const url = `https://www.youtube.com/feeds/videos.xml?channel_id=${notify.channel_id}`;

        try {
            const xml = await this.fetchUrl(url);
            // Simple regex to get the first video ID - RSS feeds are structured
            const videoIdMatch = xml.match(/<yt:videoId>([^<]+)<\/yt:videoId>/);
            const titleMatch = xml.match(/<title>([^<]+)<\/title>/g); // First title is channel, second is video
            const authorMatch = xml.match(/<name>([^<]+)<\/name>/);

            if (videoIdMatch && videoIdMatch[1]) {
                const videoId = videoIdMatch[1];
                const videoTitle = titleMatch && titleMatch[1] ? titleMatch[1].replace('<title>', '').replace('</title>', '') : 'New Video';
                const authorName = authorMatch ? authorMatch[1] : notify.channel_name;

                if (videoId !== notify.last_content_id) {
                    await this.sendNotification(notify, {
                        title: videoTitle,
                        author: authorName,
                        url: `https://www.youtube.com/watch?v=${videoId}`,
                        platform: 'YouTube',
                        thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
                    });

                    await database.updateSocialNotification(notify.id, { last_content_id: videoId });
                }
            }
        } catch (error) {
            console.error(`[Social] YouTube check failed for ${notify.channel_id}:`, error.message);
        }
    }

    async checkTwitch(notify) {
        // Note: Twitch requires OAuth and is more complex. 
        // This is a placeholder for the logic. In a real scenario, you'd need TWITCH_CLIENT_ID and TWITCH_CLIENT_SECRET.
        if (!process.env.TWITCH_CLIENT_ID || !process.env.TWITCH_CLIENT_SECRET) {
            // console.warn('[Social] Twitch credentials missing, skipping check.');
            return;
        }

        // Twitch implementation would go here...
    }

    async sendNotification(notify, data) {
        try {
            const channel = await this.client.channels.fetch(notify.notification_channel_id).catch(() => null);
            if (!channel) return;

            let messageContent = notify.message || '{author} is now live on {platform}! {url}';
            messageContent = messageContent
                .replace('{author}', data.author)
                .replace('{platform}', data.platform)
                .replace('{url}', data.url)
                .replace('{title}', data.title);

            const embed = new EmbedBuilder()
                .setColor(notify.platform === 'youtube' ? 0xFF0000 : 0x9146FF)
                .setTitle(data.title)
                .setURL(data.url)
                .setAuthor({ name: data.author })
                .setImage(data.thumbnail)
                .setTimestamp()
                .setFooter({ text: `Social Notification • ${data.platform}` });

            await channel.send({ content: messageContent, embeds: [embed] });
            console.log(`[Social] Sent ${data.platform} notification for ${data.author} in ${channel.name}`);
        } catch (error) {
            console.error('[Social] Error sending notification:', error);
        }
    }

    fetchUrl(url) {
        return new Promise((resolve, reject) => {
            https.get(url, (res) => {
                let data = '';
                res.on('data', (chunk) => data += chunk);
                res.on('end', () => resolve(data));
            }).on('error', reject);
        });
    }
}

module.exports = (client) => new SocialNotifications(client);
