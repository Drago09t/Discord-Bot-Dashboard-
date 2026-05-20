const automodDB = require('../automodDB');

// Cache for tracking messages (for spam/repeated detection)
const messageCache = new Map();
const recentMessages = new Map();

/**
 * Main automod handler - checks all enabled modules
 * @param {Message} message - Discord message object
 * @returns {Promise<boolean>} - Whether a violation was detected
 */
async function handleAutoMod(message) {
    if (!message.guild || message.author.bot) return false;

    // Skip if user is admin/mod
    if (message.member?.permissions?.has('Administrator') ||
        message.member?.permissions?.has('ManageGuild') ||
        message.member?.permissions?.has('ManageMessages')) {
        return false;
    }

    try {
        const settings = await automodDB.getSettings(message.guild.id);

        // Master switch off = skip all checks
        if (!settings.enabled) return false;

        const content = message.content;
        const channelId = message.channel.id;
        const userRoles = message.member?.roles?.cache?.map(r => r.id) || [];

        // Check global ignored channels/roles
        if (settings.ignored_channels?.includes(channelId)) return false;
        if (userRoles.some(r => settings.ignored_roles?.includes(r))) return false;

        // Check special channel modes
        if (await checkOnlyImagesChannel(message, settings)) return true;
        if (await checkOnlyYouTubeChannel(message, settings)) return true;

        // Run each module check
        const modules = settings.modules || {};

        if (await checkSpam(message, modules.spam, channelId, userRoles)) return true;
        if (await checkBadWords(message, modules.badWords, settings.bad_words_list, channelId, userRoles)) return true;
        if (await checkDuplicatedText(message, modules.duplicatedText, channelId, userRoles)) return true;
        if (await checkDiscordInvites(message, modules.discordInvites, channelId, userRoles)) return true;
        if (await checkLinks(message, modules.links, channelId, userRoles)) return true;
        if (await checkCapsSpam(message, modules.capsSpam, channelId, userRoles)) return true;
        if (await checkEmojiSpam(message, modules.emojiSpam, channelId, userRoles)) return true;
        if (await checkMassMention(message, modules.massMention, channelId, userRoles)) return true;

        return false;
    } catch (error) {
        console.error('AutoMod error:', error);
        return false;
    }
}

/**
 * Check if user should be exempt from a specific module
 */
function isExempt(moduleConfig, channelId, userRoles) {
    if (!moduleConfig?.enabled) return true;
    if (moduleConfig.disabledChannels?.includes(channelId)) return true;
    if (userRoles.some(r => moduleConfig.disabledRoles?.includes(r))) return true;
    return false;
}

/**
 * Spam detection - more than 5 messages in 5 seconds
 */
async function checkSpam(message, config, channelId, userRoles) {
    if (isExempt(config, channelId, userRoles)) return false;

    const key = `spam_${message.author.id}_${message.guild.id}`;
    const now = Date.now();
    const userMsgs = messageCache.get(key) || [];

    userMsgs.push(now);
    const recent = userMsgs.filter(time => now - time < 5000);
    messageCache.set(key, recent);

    // Clear old entries to prevent memory leak
    if (recent.length !== userMsgs.length) {
        messageCache.set(key, recent);
    }

    if (recent.length > 5) {
        await performAction(message, 'Spam Detection', config.action);
        messageCache.delete(key);
        return true;
    }

    return false;
}

/**
 * Bad words filter
 */
async function checkBadWords(message, config, badWordsList, channelId, userRoles) {
    if (isExempt(config, channelId, userRoles)) return false;
    if (!badWordsList || badWordsList.length === 0) return false;

    const lowerContent = message.content.toLowerCase();
    const hasBadWord = badWordsList.some(word => lowerContent.includes(word.toLowerCase()));

    if (hasBadWord) {
        await performAction(message, 'Prohibited Language', config.action);
        return true;
    }

    return false;
}

/**
 * Duplicated/identical text detection
 */
async function checkDuplicatedText(message, config, channelId, userRoles) {
    if (isExempt(config, channelId, userRoles)) return false;
    if (message.content.length < 10) return false;

    const key = `dup_${message.author.id}_${message.guild.id}`;
    const lastMessage = recentMessages.get(key);

    recentMessages.set(key, { content: message.content, time: Date.now() });

    if (lastMessage &&
        lastMessage.content === message.content &&
        Date.now() - lastMessage.time < 30000) {
        await performAction(message, 'Duplicated Text', config.action);
        return true;
    }

    return false;
}

/**
 * Discord invite link detection
 */
async function checkDiscordInvites(message, config, channelId, userRoles) {
    if (isExempt(config, channelId, userRoles)) return false;

    const inviteRegex = /(discord\.(gg|io|me|li)|discordapp\.com\/invite|discord\.com\/invite)\/[a-zA-Z0-9]+/gi;

    if (inviteRegex.test(message.content)) {
        await performAction(message, 'Discord Invite Links', config.action);
        return true;
    }

    return false;
}

/**
 * External link detection
 */
async function checkLinks(message, config, channelId, userRoles) {
    if (isExempt(config, channelId, userRoles)) return false;

    const urlRegex = /https?:\/\/[^\s]+/gi;

    if (urlRegex.test(message.content)) {
        await performAction(message, 'External Links', config.action);
        return true;
    }

    return false;
}

/**
 * Caps spam detection (70%+ uppercase)
 */
async function checkCapsSpam(message, config, channelId, userRoles) {
    if (isExempt(config, channelId, userRoles)) return false;
    if (message.content.length < 10) return false;

    const letters = message.content.replace(/[^a-zA-Z]/g, '');
    if (letters.length < 5) return false;

    const caps = letters.replace(/[^A-Z]/g, '').length;
    const percentage = (caps / letters.length) * 100;

    if (percentage >= 70) {
        await performAction(message, 'Excessive Caps', config.action);
        return true;
    }

    return false;
}

/**
 * Emoji spam detection (more than 10 emojis)
 */
async function checkEmojiSpam(message, config, channelId, userRoles) {
    if (isExempt(config, channelId, userRoles)) return false;

    const emojiRegex = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|<a?:\w+:\d+>/gu;
    const emojis = message.content.match(emojiRegex) || [];

    if (emojis.length > 10) {
        await performAction(message, 'Emoji Spam', config.action);
        return true;
    }

    return false;
}

/**
 * Mass mention detection (more than 5 mentions)
 */
async function checkMassMention(message, config, channelId, userRoles) {
    if (isExempt(config, channelId, userRoles)) return false;

    const mentionCount = message.mentions.users.size + message.mentions.roles.size;

    if (mentionCount > 5) {
        await performAction(message, 'Mass Mentions', config.action);
        return true;
    }

    return false;
}

/**
 * Only images channel check
 */
async function checkOnlyImagesChannel(message, settings) {
    if (!settings.only_images_channels?.includes(message.channel.id)) return false;

    const hasImage = message.attachments.some(a => a.contentType?.startsWith('image/'));
    const hasEmbed = message.embeds.some(e => e.image || e.thumbnail);

    if (!hasImage && !hasEmbed && message.content.length > 0) {
        await performAction(message, 'Only Images Allowed', 'block');
        return true;
    }

    return false;
}

/**
 * Only YouTube links channel check
 */
async function checkOnlyYouTubeChannel(message, settings) {
    if (!settings.only_youtube_channels?.includes(message.channel.id)) return false;

    const youtubeRegex = /(youtube\.com|youtu\.be)/gi;

    if (!youtubeRegex.test(message.content)) {
        await performAction(message, 'Only YouTube Links Allowed', 'block');
        return true;
    }

    return false;
}

/**
 * Perform moderation action
 */
async function performAction(message, reason, action) {
    try {
        // Always try to delete the message
        await message.delete().catch(() => { });

        // Send warning embed
        const warnEmbed = {
            color: 0xff0000,
            title: '🛡️ Auto-Moderation',
            description: `${message.author}, your message was removed.`,
            fields: [{ name: 'Reason', value: reason }],
            timestamp: new Date().toISOString()
        };

        const warning = await message.channel.send({ embeds: [warnEmbed] });
        setTimeout(() => warning.delete().catch(() => { }), 5000);

        // Mute user if action is 'mute'
        if (action === 'mute') {
            try {
                await message.member.timeout(60000, `AutoMod: ${reason}`); // 1 minute timeout
            } catch (e) {
                console.error('Failed to mute user:', e.message);
            }
        }

        console.log(`[AutoMod] ${reason}: ${message.author.tag} in ${message.guild.name}`);
    } catch (error) {
        console.error('AutoMod action failed:', error.message);
    }
}

// Cleanup old cache entries every 5 minutes
setInterval(() => {
    const now = Date.now();

    for (const [key, times] of messageCache.entries()) {
        const recent = times.filter(t => now - t < 10000);
        if (recent.length === 0) {
            messageCache.delete(key);
        } else {
            messageCache.set(key, recent);
        }
    }

    for (const [key, data] of recentMessages.entries()) {
        if (now - data.time > 60000) {
            recentMessages.delete(key);
        }
    }
}, 300000);

module.exports = { handleAutoMod };
