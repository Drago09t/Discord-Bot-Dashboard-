require('dotenv').config();
const fs = require('fs');
const { Client, GatewayIntentBits, Partials, Events } = require('discord.js');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const getCommands = require('./commands');
const channelDB = require('./channelDB');
const inviteTracker = require('./inviteTracker');
const database = require('./database');
const aiService = require('./aiService');
const { handleSlashCommand } = require('./slashCommandHandler');
const voiceManager = require('./voiceManager');
const voiceDB = require('./voiceDB');
const rankingDB = require('./rankingDB');
const adminDB = require('./AdminDB');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildMessageReactions,
  ],
  partials: [Partials.Message, Partials.Reaction, Partials.User],
});



// Built-in Feature Imports
const welcomeSystem = require('./features/welcomeSystem');
const autoMod = require('./features/autoMod');
const autoRole = require('./features/autoRole');
const messageLogger = require('./features/logger'); // Updated to new logger
const afkSystem = require('./features/afkSystem');
const autoReaction = require('./features/autoReaction');
const activityTracker = require('./features/activityTracker');
const antiRaid = require('./features/antiRaid');
const statsChannels = require('./features/statsChannels');
const reactionRoles = require('./features/reactionRoles');
const ticketSystem = require('./features/ticketSystem');
const giveawaySystem = require('./features/giveawaySystem');
const musicSystem = require('./features/musicSystem');
const socialNotifications = require('./features/socialNotifications');

// Initialize features that need immediate event registration
giveawaySystem(client);
musicSystem(client);
socialNotifications(client);

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

const conversationHistory = new Map();
const DEFAULT_PREFIX = '!';
const prefixCache = new Map();

async function getGuildPrefix(guildId) {
  if (!guildId) return DEFAULT_PREFIX;
  if (prefixCache.has(guildId)) return prefixCache.get(guildId);

  try {
    const prefix = await database.getPrefix(guildId);
    prefixCache.set(guildId, prefix);
    return prefix;
  } catch (error) {
    console.error(`Error getting prefix for guild ${guildId}:`, error);
    return DEFAULT_PREFIX;
  }
}

function clearPrefixCache(guildId) {
  if (guildId) {
    prefixCache.delete(guildId);
    console.log(`[Cache] Cleared prefix cache for guild: ${guildId}`);
  } else {
    prefixCache.clear();
    console.log('[Cache] Cleared all prefix caches');
  }
}

const userRequestQueue = new Map();
const lastRequestTime = new Map();

let commands;

const activityStatuses = [
  { name: '!help or /help for commands', type: 0 },
  { name: 'AI conversations', type: 3 },
  { name: 'your messages', type: 2 },
  { name: 'with AI technology', type: 0 },
  { name: 'users learn', type: 3 },
  { name: 'smart AI assistance', type: 0 },
  { name: 'Discord with Gemini AI', type: 0 },
  { name: 'conversations 24/7', type: 2 },
  { name: 'to your questions', type: 2 },
  { name: 'AI assistance with slash commands', type: 0 },
];
let currentActivityIndex = 0;

client.once('ready', async () => {
  commands = getCommands(client, conversationHistory, DEFAULT_PREFIX);

  function updateActivity() {
    const status = activityStatuses[currentActivityIndex];
    client.user.setPresence({
      activities: [{
        name: status.name,
        type: status.type,
      }],
      status: 'online',
    });
    currentActivityIndex = (currentActivityIndex + 1) % activityStatuses.length;
  }

  updateActivity();
  setInterval(updateActivity, 30000);

  console.log('\n\x1b[36m' + '╔' + '═'.repeat(68) + '╗\x1b[0m');
  console.log('\x1b[36m║\x1b[0m' + ' '.repeat(68) + '\x1b[36m║\x1b[0m');
  console.log('\x1b[36m║\x1b[32m          🤖  DISCORD AI CHATBOT - ONLINE  🤖\x1b[36m                    ║\x1b[0m');
  console.log('\x1b[36m║\x1b[0m' + ' '.repeat(68) + '\x1b[36m║\x1b[0m');
  console.log('\x1b[36m╠' + '═'.repeat(68) + '╣\x1b[0m');
  console.log('\x1b[36m║\x1b[0m  \x1b[33m👤 Bot Tag:\x1b[0m      ' + client.user.tag.padEnd(50) + '\x1b[36m║\x1b[0m');
  console.log('\x1b[36m║\x1b[0m  \x1b[33m🆔 Bot ID:\x1b[0m       ' + client.user.id.padEnd(50) + '\x1b[36m║\x1b[0m');
  console.log('\x1b[36m║\x1b[0m  \x1b[33m📊 Servers:\x1b[0m      ' + client.guilds.cache.size.toString().padEnd(50) + '\x1b[36m║\x1b[0m');
  console.log('\x1b[36m║\x1b[0m  \x1b[33m👥 Total Users:\x1b[0m  ' + client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0).toString().padEnd(50) + '\x1b[36m║\x1b[0m');
  console.log('\x1b[36m║\x1b[0m  \x1b[33m🧠 AI Model:\x1b[0m     ' + 'Google Gemini 2.5 Flash'.padEnd(50) + '\x1b[36m║\x1b[0m');
  console.log('\x1b[36m║\x1b[0m  \x1b[33m⚡ Default Prefix:\x1b[0m ' + DEFAULT_PREFIX.padEnd(50) + '\x1b[36m║\x1b[0m');
  console.log('\x1b[36m║\x1b[0m' + ' '.repeat(68) + '\x1b[36m║\x1b[0m');
  console.log('\x1b[36m╠' + '═'.repeat(68) + '╣\x1b[0m');
  console.log('\x1b[36m║\x1b[35m                     📋 AVAILABLE COMMANDS                          \x1b[36m║\x1b[0m');
  console.log('\x1b[36m╠' + '═'.repeat(68) + '╣\x1b[0m');

  const commandCategories = {
    '📚 General': ['help', 'invites'],
    '👤 User': ['clear', 'history'],
    '🤖 AI Tools': ['ask', 'translate', 'summarize', 'code', 'improve', 'brainstorm', 'persona', 'analyze']
  };

  Object.entries(commandCategories).forEach(([category, cmdNames]) => {
    console.log('\x1b[36m║\x1b[0m  \x1b[1m' + category + '\x1b[0m'.padEnd(73) + '\x1b[36m║\x1b[0m');
    cmdNames.forEach(name => {
      const cmd = commands[name];
      console.log('\x1b[36m║\x1b[0m    • ' + cmd.usage.padEnd(20) + cmd.description.substring(0, 40).padEnd(40) + '\x1b[36m║\x1b[0m');
    });
    console.log('\x1b[36m║\x1b[0m' + ' '.repeat(68) + '\x1b[36m║\x1b[0m');
  });

  console.log('\x1b[36m╠' + '═'.repeat(68) + '╣\x1b[0m');
  console.log('\x1b[36m║\x1b[32m  ✨ FEATURES:\x1b[0m                                                     \x1b[36m║\x1b[0m');
  console.log('\x1b[36m║\x1b[0m    • Context-aware conversations with memory                       \x1b[36m║\x1b[0m');
  console.log('\x1b[36m║\x1b[0m    • Multi-language support (15+ languages)                        \x1b[36m║\x1b[0m');
  console.log('\x1b[36m║\x1b[0m    • Advanced Discord markdown formatting                          \x1b[36m║\x1b[0m');
  console.log('\x1b[36m║\x1b[0m    • Dedicated AI channels                                         \x1b[36m║\x1b[0m');
  console.log('\x1b[36m║\x1b[0m    • Code syntax highlighting                                      \x1b[36m║\x1b[0m');
  console.log('\x1b[36m║\x1b[0m' + ' '.repeat(68) + '\x1b[36m║\x1b[0m');
  console.log('\x1b[36m╠' + '═'.repeat(68) + '╣\x1b[0m');
  console.log('\x1b[36m║\x1b[32m  💬 USAGE:\x1b[0m                                                        \x1b[36m║\x1b[0m');
  console.log('\x1b[36m║\x1b[0m    • Mention @' + client.user.username + ' for casual conversation'.padEnd(66) + '\x1b[36m║\x1b[0m');
  console.log('\x1b[36m║\x1b[0m    • Use slash commands or ! prefix                                \x1b[36m║\x1b[0m');
  console.log('\x1b[36m║\x1b[0m    • Send DMs directly to the bot                                  \x1b[36m║\x1b[0m');
  console.log('\x1b[36m║\x1b[0m' + ' '.repeat(68) + '\x1b[36m║\x1b[0m');
  console.log('\x1b[36m╚' + '═'.repeat(68) + '╝\x1b[0m\n');
  console.log('\x1b[32m✅ System initialized successfully! Ready to serve users.\x1b[0m\n');

  // Analytics: Hourly Snapshot Task (Run every 1 min for realtime updates)
  setInterval(async () => {
    try {
      for (const guild of client.guilds.cache.values()) {
        await database.aggregateDailyAnalytics(guild.id, guild.memberCount);
      }
    } catch (err) {
      console.error('[Analytics] Snapshot task error:', err);
    }
  }, 60 * 1000); // Run every minute

  // Initial snapshot and Voice Sync on startup
  (async () => {
    for (const guild of client.guilds.cache.values()) {
      // Init Analytics
      database.aggregateDailyAnalytics(guild.id, guild.memberCount).catch(() => { });

      // Sync Voice Sessions
      try {
        const openSessionUserIds = await database.getOpenVoiceSessions(guild.id);
        const voiceStates = guild.voiceStates.cache.filter(vs => vs.channelId && vs.member && !vs.member.user.bot);
        const currentVoiceUserIds = new Set(voiceStates.map(vs => vs.id));

        // Resume missing
        for (const [userId, vs] of voiceStates) {
          if (!openSessionUserIds.includes(userId)) {
            await database.startVoiceSession(userId, guild.id, vs.channelId);
            console.log(`[VoiceXP] Synced: Started session for ${vs.member.user.tag}`);
          }
        }

        // Close stale
        for (const userId of openSessionUserIds) {
          if (!currentVoiceUserIds.has(userId)) {
            const result = await database.endVoiceSession(userId, guild.id);
            if (result) console.log(`[VoiceXP] Synced: Closed stale session for user ${userId} (${result.duration.toFixed(1)} mins)`);
          }
        }
      } catch (err) {
        console.error(`[VoiceXP] Sync failed for ${guild.name}:`, err);
      }
    }
  })();

  // Auto-reconnect to 24/7 voice channels
  (async () => {
    try {
      const all247Channels = await voiceDB.get247Channels();
      let reconnectedCount = 0;

      for (const channelData of all247Channels) {
        try {
          const guild = client.guilds.cache.get(channelData.guildId);
          if (!guild) continue;

          const channel = guild.channels.cache.get(channelData.channelId);
          if (!channel) {
            console.log(`⚠️ 24/7 channel not found: ${channelData.channelName} (may have been deleted)`);
            continue;
          }

          await voiceManager.joinChannel(channel, true);
          reconnectedCount++;
          console.log(`🔄 Reconnected to 24/7 voice: ${channel.name} in ${guild.name}`);
        } catch (error) {
          console.error(`Failed to reconnect to 24/7 channel ${channelData.channelName}:`, error.message);
        }
      }

      if (reconnectedCount > 0) {
        console.log(`\x1b[32m✅ Reconnected to ${reconnectedCount} 24/7 voice channel(s)\x1b[0m\n`);
      }
    } catch (error) {
      console.error('Error reconnecting to 24/7 voice channels:', error);
    }
  })();

  setInterval(async () => {
    try {
      const pendingReminders = await database.getPendingReminders();

      for (const reminder of pendingReminders) {
        try {
          const channel = await client.channels.fetch(reminder.channel_id).catch(() => null);
          const user = await client.users.fetch(reminder.user_id).catch(() => null);

          if (channel && user) {
            await channel.send({
              content: `<@${reminder.user_id}> Reminder: ${reminder.reminder_text}`
            });
          }

          await database.markReminderComplete(reminder.id);
        } catch (error) {
          console.error('Error sending reminder:', error);
          await database.markReminderComplete(reminder.id);
        }
      }
    } catch (error) {
      console.error('Error checking reminders:', error);
    }
  }, 60000);

  // Periodic Server Stats Updates (every 10 minutes)
  setInterval(() => statsChannels.updateStatsChannels(client), 600000);

  // Initialize Ticket System
  ticketSystem(client);

  // Initialize Invite Tracker
  inviteTracker.init(client).catch(err => console.error('[InviteTracker] Init error:', err));



  // Start Dashboard Server
  try {
    const { default: startDashboard } = await import('./dashboard/server/index.js');
    startDashboard(client, { clearPrefixCache });
  } catch (err) {
    console.error('Failed to start dashboard:', err);
  }
});

// --- Advanced Admin Suite Event Listeners ---

client.on('guildCreate', async (guild) => {
  console.log(`[Bot] Joined new guild: ${guild.name} (${guild.id}) with ${guild.memberCount} members`);
  await adminDB.logGuildAction(guild.id, guild.name, 'join', guild.memberCount);
});

client.on('guildDelete', async (guild) => {
  console.log(`[Bot] Left guild: ${guild.name} (${guild.id})`);
  await adminDB.logGuildAction(guild.id, guild.name, 'leave', guild.memberCount);
});

client.on('globalBroadcast', async ({ content, targetGuilds, targetType }) => {
  console.log(`[Broadcast] Sending broadcast to ${targetGuilds.length} ${targetType} clusters...`);

  const embed = {
    color: 0xFFD700,
    title: '📢 Global System Broadcast',
    description: content,
    thumbnail: { url: client.user.displayAvatarURL() },
    footer: { text: 'Bot Management System • Official Announcement' },
    timestamp: new Date().toISOString()
  };

  for (const guildId of targetGuilds) {
    try {
      const guild = client.guilds.cache.get(guildId);
      if (!guild) continue;

      const channel = guild.channels.cache.find(c =>
        (c.type === 0 && c.permissionsFor(client.user).has('SendMessages')) &&
        (c.name.includes('general') || c.name.includes('announcement') || c.name.includes('bot'))
      ) || guild.channels.cache.find(c => c.type === 0 && c.permissionsFor(client.user).has('SendMessages'));

      if (channel) {
        await channel.send({ embeds: [embed] });
      }
    } catch (err) {
      console.error(`[Broadcast] Failed for guild ${guildId}:`, err.message);
    }
  }
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  // 1. Blacklist Check
  const isBlacklisted = await adminDB.isBlacklisted(interaction.user.id) || await adminDB.isBlacklisted(interaction.guildId);
  if (isBlacklisted) {
    return interaction.reply({
      content: '❌ **Access Denied:** You or this server have been globally blacklisted from using this bot.',
      ephemeral: true
    });
  }

  // 2. Maintenance Mode Check
  const maintenance = await adminDB.isMaintenanceMode();
  const isAdmin = await premiumDB.isBotAdmin(interaction.user.id);
  if (maintenance && !isAdmin) {
    return interaction.reply({
      content: '🛠️ **Maintenance Mode:** The bot is currently undergoing maintenance. Please try again later.',
      ephemeral: true
    });
  }

  // 3. Log Usage
  await adminDB.logCommandUsage(interaction.guildId, interaction.user.id, interaction.commandName, 'slash');

  const prefix = await getGuildPrefix(interaction.guildId);
  await handleSlashCommand(interaction, client, conversationHistory, prefix);
});

client.on('messageCreate', async (message) => {
  if (!message.author.bot) {
    console.log(`[Message Rx] ${message.author.tag}: ${message.content}`); // Debug log
  }
  if (message.author.bot) return;

  // Run build-in features
  const wasModerated = await autoMod.handleAutoMod(message);
  if (wasModerated) return;

  // AI Auto-Moderator
  if (!message.guild) return; // Skip DMs for AI mod
  try {
    const aiModSettings = await database.getAIModSettings(message.guild.id);
    if (aiModSettings.enabled) {
      const analysis = await aiService.analyzeMessage(message.content);
      if (analysis && analysis.is_toxic) {
        await database.logAIAction(
          message.guild.id,
          message.author.id,
          message.channel.id,
          message.content,
          analysis.reason,
          analysis.score,
          aiModSettings.action_type
        );

        if (aiModSettings.action_type === 'delete') {
          await message.delete().catch(() => { });
          await message.channel.send(`⚠️ ${message.author}, your message was removed by AI moderation: ${analysis.reason}`).then(m => setTimeout(() => m.delete(), 5000));
        } else if (aiModSettings.action_type === 'warn') {
          await message.channel.send(`⚠️ ${message.author}, please watch your language: ${analysis.reason}`).then(m => setTimeout(() => m.delete(), 5000));
        }
        // 'flag' just logs, no action
      }
    }
  } catch (error) {
    console.error('[AI Mod] Error:', error);
  }

  await afkSystem.handleAFK(message);
  await autoReaction.handleAutoReaction(message);
  await activityTracker.handleActivityMapping(message);

  // Analytics: Record message activity
  if (message.guild) {
    database.incrementMessageActivity(message.guild.id, message.channel.id).catch(console.error);
  }

  const prefix = await getGuildPrefix(message.guild?.id);
  const isDM = message.channel.type === 1;
  const isCommand = message.content.startsWith(prefix);
  const isMentioned = message.mentions.has(client.user);
  const isAIChannel = !isDM && await channelDB.isAIChannel(message.channel.id);

  if (isDM && !isCommand) {
    try {
      const { isNew } = await database.trackDMConversation(
        message.author.id,
        message.author.username
      );

      if (isNew) {
        const welcomeEmbed = {
          color: 0x00ffaa,
          title: '👋 Welcome to Direct Messages!',
          description: '```ansi\n\x1b[1;36m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\x1b[0m\n```',
          fields: [
            {
              name: '💬 How to Chat',
              value: '```yaml\nJust send me messages directly!\nNo commands or mentions needed.\n```',
              inline: false,
            },
            {
              name: '📋 Available Commands',
              value: '```fix\nType !help to see all commands\n```',
              inline: false,
            },
            {
              name: '🤖 AI Features',
              value: '```diff\n+ Context-aware conversations\n+ Multi-language support\n+ Advanced formatting\n+ Personalized responses\n```',
              inline: false,
            },
            {
              name: '💡 Quick Tips',
              value: '```yaml\n- Use !clear to reset conversation\n- Use !persona to change AI style\n- Use !translate for translations\n- Use !code for coding help\n```',
              inline: false,
            },
          ],
          footer: {
            text: `Welcome, ${message.author.username}!`,
            icon_url: message.author.displayAvatarURL(),
          },
          timestamp: new Date().toISOString(),
        };

        await message.channel.send({ embeds: [welcomeEmbed] });
      }
    } catch (error) {
      console.error('Error tracking DM:', error);
    }
  }

  if (isCommand) {
    // 1. Blacklist Check
    const isBlacklisted = await adminDB.isBlacklisted(message.author.id) || await adminDB.isBlacklisted(message.guildId);
    if (isBlacklisted) return; // Silent block for prefix to avoid spam

    // 2. Maintenance Mode Check
    const maintenance = await adminDB.isMaintenanceMode();
    const isAdmin = await premiumDB.isBotAdmin(message.author.id);
    if (maintenance && !isAdmin) {
      return message.reply('🛠️ **Maintenance Mode:** The bot is currently undergoing maintenance. Please try again later.');
    }

    const args = message.content.slice(prefix.length).trim().split(/\s+/);
    const commandName = args[0].toLowerCase();

    // 3. Log Usage
    await adminDB.logCommandUsage(message.guildId, message.author.id, commandName, 'prefix');
    const command = commands[commandName];

    if (!command) {
      return message.reply(`❌ Unknown command: **${commandName}**. Use \`!help\` to see available commands.`);
    }

    try {
      await command.execute(message, args.slice(1));
    } catch (error) {
      console.error(`Error executing command ${commandName}:`, error);
      await message.reply('❌ An error occurred while executing this command.');
    }
    return;
  }

  // Economy & XP System for server messages
  if (message.guild && !message.author.bot) {
    try {
      const profile = await database.getOrCreateProfile(message.author.id, message.guild.id);
      const now = Date.now();
      const cooldown = 60000; // 60 seconds

      if (!profile.updated_at || (now - new Date(profile.updated_at).getTime()) >= cooldown) {
        const xpGain = Math.floor(Math.random() * 11) + 15; // 15-25 XP
        const coinGain = Math.floor(Math.random() * 11) + 10; // 10-20 coins

        const oldLevel = profile.level;
        const updated = await database.addXP(message.author.id, message.guild.id, xpGain);
        await database.addCoins(message.author.id, message.guild.id, coinGain);

        // Level up notification
        if (updated.level > oldLevel) {
          const levelUpEmbed = {
            color: 0xffd700,
            title: '🎉 Level Up!',
            description: `**${message.author.username}** just leveled up!`,
            fields: [
              { name: '📊 New Level', value: `${updated.level}`, inline: true },
              { name: '🎯 Total XP', value: `${updated.xp.toLocaleString()}`, inline: true }
            ],
            footer: { text: 'Keep chatting to earn more coins!' },
            timestamp: new Date().toISOString()
          };

          await message.channel.send({ embeds: [levelUpEmbed] }).catch(() => { });
        }
      }
    } catch (error) {
      console.error('Economy/XP system error:', error);
    }
  }

  // AI Channels & Advanced Settings
  let channelConfig = null;
  let shouldReply = isMentioned || isDM;

  if (!isDM && message.guild) {
    channelConfig = await channelDB.getChannelConfig(message.channel.id);
    if (channelConfig && channelConfig.enabled) {
      if (!isMentioned && channelConfig.reply_chance > 0) {
        if (Math.random() < channelConfig.reply_chance) {
          shouldReply = true;
        }
      } else if (isMentioned) {
        shouldReply = true;
      } else {
        // Special case: if it was just a "whitelisted" channel before, 
        // it always replied. We keep that behavior if reply_chance is not set or high.
        // But with the new system, enabled means it responds. 
        // If they want it to ONLY respond to mentions, they set reply_chance to 0.
        // If they want it to ALWAYS respond, they set reply_chance to 1.
        // For backwards compatibility with the "AI Channel" concept:
        shouldReply = true;
      }
    }
  }

  if (!shouldReply) return;

  let messageContent = message.content
    .replace(`<@${client.user.id}>`, '')
    .replace(`<@!${client.user.id}>`, '')
    .trim();

  if (!messageContent && isMentioned) {
    return message.reply('Hi! How can I help you today?');
  } else if (!messageContent) return;

  const userId = message.author.id;
  const now = Date.now();
  const userLastRequest = lastRequestTime.get(userId) || 0;
  const timeSinceLastRequest = now - userLastRequest;
  const minDelayMs = 2000;

  if (timeSinceLastRequest < minDelayMs) {
    const waitTime = Math.ceil((minDelayMs - timeSinceLastRequest) / 1000);
    return message.reply(`⏳ Please wait ${waitTime}s before sending another message (free tier rate limit).`);
  }

  lastRequestTime.set(userId, now);

  if (!conversationHistory.has(userId)) {
    conversationHistory.set(userId, []);
  }

  const history = conversationHistory.get(userId);
  history.push({
    role: 'user',
    parts: [{ text: messageContent }],
  });

  if (history.length > (channelConfig?.context_length || 20)) {
    history.splice(0, history.length - (channelConfig?.context_length || 20));
  }

  try {
    await message.channel.sendTyping();

    // Persona Logic
    const AI_PERSONAS = {
      'Default AI': 'You are an advanced AI assistant on Discord.',
      'Sarcastic': 'You are a sarcastic, witty, and slightly passive-aggressive AI assistant. Use humor and sass in your responses.',
      'Pirate': 'You are a gritty 17th-century pirate captain. Talk like one, using terms like "ahoy", "scallywag", and "matey".',
      'Professional': 'You are a highly professional, formal, and technical expert. Be precise and avoid slang.',
      'Friendly': 'You are a warm, casual friend. Be very supportive, informal, and use emojis.'
    };

    let basePrompt = AI_PERSONAS[channelConfig?.personality] || AI_PERSONAS['Default AI'];
    if (channelConfig?.personality === 'Custom' && channelConfig.system_prompt) {
      basePrompt = channelConfig.system_prompt;
    }

    const systemPrompt = `${basePrompt} Follow these formatting guidelines:

1. Use **bold** for important information, emphasis, and key points
2. Use *italics* for subtle emphasis and quotes
3. Use \`inline code\` for technical terms, commands, and short code snippets
4. Use \`\`\`language\ncode blocks\n\`\`\` for multi-line code (e.g., \`\`\`javascript, \`\`\`python, \`\`\`bash)
5. Use > for quotes and callouts
6. Use bullet points with - or • for lists
7. Use numbered lists (1. 2. 3.) for step-by-step instructions
8. Use __underline__ sparingly for critical information
9. Use ~~strikethrough~~ for corrections or outdated info
10. Use headers sparingly: ## Main Topic, ### Subtopic

Multi-language support:
- Detect the user's language and respond in the same language
- Support English, Spanish, French, German, Italian, Portuguese, Russian, Chinese, Japanese, Korean, Arabic, Hindi, and more
- Maintain natural, native-like fluency in all languages
- Use proper grammar, idioms, and cultural context

Response quality:
- Be concise but informative
- Break down complex topics into digestible sections
- Use formatting to improve readability
- Include relevant examples when helpful
- Be engaging and conversational
- Adapt tone to match the user's style

Remember: Format your responses with Discord markdown to make them visually appealing and easy to read.`;

    const enrichedHistory = [
      {
        role: 'user',
        parts: [{ text: systemPrompt }],
      },
      {
        role: 'model',
        parts: [{ text: 'Understood! I will use proper Discord markdown formatting with **bold**, *italics*, `code blocks`, and other formatting features. I will also respond in the user\'s language and provide well-structured, engaging responses.' }],
      },
      ...history.slice(0, -1)
    ];

    const chat = model.startChat({
      history: enrichedHistory,
      generationConfig: {
        maxOutputTokens: 800,
        temperature: 0.9,
      },
    });

    let response;
    let retries = 2;
    let lastError;

    while (retries > 0) {
      try {
        const result = await Promise.race([
          chat.sendMessage(messageContent),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Request timeout')), 25000)
          )
        ]);
        response = result.response.text();
        break;
      } catch (error) {
        lastError = error;
        const isSocketError = error.message?.includes('UND_ERR_SOCKET') || error.code === 'UND_ERR_SOCKET';

        if (isSocketError) {
          retries = 0;
        } else {
          retries--;
        }

        if (retries > 0) {
          const backoffMs = Math.pow(2, 2 - retries) * 1500;
          console.log(`Retry attempt ${3 - retries}/2 after ${backoffMs}ms:`, error.message);
          await new Promise(resolve => setTimeout(resolve, backoffMs));
          await message.channel.sendTyping();
        }
      }
    }

    if (!response) {
      throw lastError || new Error('Failed to get response after retries');
    }

    history.push({
      role: 'model',
      parts: [{ text: response }],
    });

    if (response.length > 2000) {
      const chunks = [];
      let currentChunk = '';
      const lines = response.split('\n');

      for (const line of lines) {
        if ((currentChunk + line + '\n').length > 1900) {
          if (currentChunk) chunks.push(currentChunk.trim());
          currentChunk = line + '\n';
        } else {
          currentChunk += line + '\n';
        }
      }

      if (currentChunk) chunks.push(currentChunk.trim());

      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        const footer = chunks.length > 1 ? `\n\n*[Message ${i + 1}/${chunks.length}]*` : '';
        await message.reply(chunk + footer);
        if (i < chunks.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
    } else {
      await message.reply(response);
    }
  } catch (error) {
    console.error('Error generating response:', error);

    const history = conversationHistory.get(userId);
    if (history && history.length > 0) {
      history.pop();
    }

    let errorMessage = 'Sorry, I encountered an error while processing your message.';

    if (error.message?.includes('timeout')) {
      errorMessage = 'The request timed out. Try a shorter message.';
    } else if (error.message?.includes('UND_ERR_SOCKET') || error.code === 'UND_ERR_SOCKET') {
      errorMessage = 'Connection error. Please wait a moment and try again.';
    } else if (error.status === 429) {
      errorMessage = 'Rate limit reached. Please wait before trying again.';
    } else if (error.status === 500 || error.status === 503) {
      errorMessage = 'The AI service is temporarily down. Try again later.';
    }

    await message.reply(`❌ ${errorMessage}`);
  }
});

client.on('error', (error) => {
  console.error('Discord client error:', error);
});

process.on('unhandledRejection', (error) => {
  console.error('Unhandled promise rejection:', error);
});

// Guild Member Events
client.on('guildMemberAdd', async (member) => {
  await welcomeSystem.handleMemberJoin(member);
  await autoRole.handleAutoRole(member);
  await antiRaid.handleAntiRaid(member);
  await messageLogger.memberJoin(member); // New Logger
});

client.on('guildMemberRemove', async (member) => {
  await welcomeSystem.handleMemberLeave(member);
  await messageLogger.memberLeave(member); // New Logger
});

client.on('guildMemberUpdate', async (oldMember, newMember) => {
  await messageLogger.memberUpdate(oldMember, newMember);
});

// Message Log Events
client.on('messageDelete', async (message) => {
  await messageLogger.messageDelete(message);
});

client.on('messageUpdate', async (oldMessage, newMessage) => {
  await messageLogger.messageUpdate(oldMessage, newMessage);
});

// Channel Events
client.on('channelCreate', async (channel) => {
  await messageLogger.channelCreate(channel);
});

client.on('channelDelete', async (channel) => {
  await messageLogger.channelDelete(channel);
});

client.on('channelUpdate', async (oldChannel, newChannel) => {
  await messageLogger.channelUpdate(oldChannel, newChannel);
});

// Role Events
client.on('roleCreate', async (role) => {
  await messageLogger.roleCreate(role);
});

client.on('roleDelete', async (role) => {
  await messageLogger.roleDelete(role);
});

client.on('roleUpdate', async (oldRole, newRole) => {
  await messageLogger.roleUpdate(oldRole, newRole);
});

// Voice Events
client.on('voiceStateUpdate', async (oldState, newState) => {
  await messageLogger.voiceStateUpdate(oldState, newState);
});

// Moderation Events
client.on('guildBanAdd', async (ban) => {
  await messageLogger.memberBanAdd(ban);
});

client.on('guildBanRemove', async (ban) => {
  await messageLogger.memberBanRemove(ban);
});

// Server Events
client.on('guildUpdate', async (oldGuild, newGuild) => {
  await messageLogger.guildUpdate(oldGuild, newGuild);
});

client.on('inviteCreate', async (invite) => {
  await messageLogger.inviteCreate(invite);
});

// Reaction Role Events
client.on(Events.MessageReactionAdd, async (reaction, user) => {
  await reactionRoles.handleReactionRole(reaction, user, 'add');
});

client.on(Events.MessageReactionRemove, async (reaction, user) => {
  await reactionRoles.handleReactionRole(reaction, user, 'remove');
});

if (!process.env.DISCORD_BOT_TOKEN) {
  console.error('❌ Error: DISCORD_BOT_TOKEN is not set in .env file');
  process.exit(1);
}

if (!process.env.GEMINI_API_KEY) {
  console.error('❌ Error: GEMINI_API_KEY is not set in .env file');
  process.exit(1);
}

client.on('guildMemberAdd', async (member) => {
  try {
    const invite = await inviteTracker.handleJoin(member);
    const settings = await database.getInviteSettings(member.guild.id);

    if (settings && settings.enabled && settings.logs_channel_id) {
      const logChannel = member.guild.channels.cache.get(settings.logs_channel_id);
      if (logChannel) {
        const inviter = invite ? invite.inviter : null;
        const code = invite ? invite.code : 'Unknown';
        const inviterTag = inviter ? inviter.tag : 'Unknown';
        const inviterId = inviter ? inviter.id : null;

        // Update stats in DB
        await database.recordMemberJoin(member.guild.id, member.id, inviterId, code);
        const inviterStats = inviterId ? await database.getUserInvites(inviterId, member.guild.id) : { regular: 0 };

        let msg = settings.join_message || '{user} joined using invite code {code} from {inviter}. Total invites: {total}';
        msg = msg.replace('{user}', `<@${member.id}>`)
          .replace('{inviter}', inviterTag)
          .replace('{code}', code)
          .replace('{total}', inviterStats.regular)
          .replace('{server}', member.guild.name);

        logChannel.send(msg).catch(console.error);
      }
    }

    // Update count channel if configured
    if (settings && settings.count_channel_id) {
      const countChannel = member.guild.channels.cache.get(settings.count_channel_id);
      if (countChannel && countChannel.type === 2) { // Voice Channel
        const inviteList = await member.guild.invites.fetch();
        const totalInvites = inviteList.reduce((acc, inv) => acc + inv.uses, 0);
        countChannel.setName(`Total Invites: ${totalInvites}`).catch(() => { });
      }
    }

    // Update specific inviter status channel (Voice)
    if (settings && settings.status_channel_id) {
      const statusChannel = member.guild.channels.cache.get(settings.status_channel_id);
      if (statusChannel && statusChannel.type === 2) { // Voice Channel
        const inviter = invite ? invite.inviter : null;
        if (inviter) {
          const inviterStats = await database.getUserInvites(inviter.id, member.guild.id);
          const total = inviterStats.regular || 0;
          statusChannel.setName(`@${inviter.username} has ${total} invites`).catch(() => { });
        }
      }
    }

    // Update specific inviter status (Text)
    if (settings && settings.status_text_channel_id) {
      const statusTextChannel = member.guild.channels.cache.get(settings.status_text_channel_id);
      if (statusTextChannel && (statusTextChannel.type === 0 || statusTextChannel.type === 5)) {
        const inviter = invite ? invite.inviter : null;
        if (inviter) {
          const inviterStats = await database.getUserInvites(inviter.id, member.guild.id);
          const total = inviterStats.regular || 0;
          statusTextChannel.send(`<@${inviter.id}> has **${total}** total invites now`).catch(() => { });
        }
      }
    }
  } catch (error) {
    console.error('Error in guildMemberAdd (Invite Logger):', error);
  }
});

client.on('guildMemberRemove', async (member) => {
  try {
    const settings = await database.getInviteSettings(member.guild.id);
    await database.recordMemberLeave(member.guild.id, member.id);

    if (settings && settings.enabled && settings.logs_channel_id) {
      const logChannel = member.guild.channels.cache.get(settings.logs_channel_id);
      if (logChannel) {
        const history = await database.getInviteHistory(member.id, member.guild.id); // Need to add this method or similar
        const inviterTag = history?.inviter_id ? (await client.users.fetch(history.inviter_id).catch(() => ({ tag: 'Unknown' }))).tag : 'Unknown';

        let msg = settings.leave_message || '{user} left. They were invited by {inviter}.';
        msg = msg.replace('{user}', `**${member.user.tag}**`)
          .replace('{inviter}', inviterTag)
          .replace('{server}', member.guild.name);

        logChannel.send(msg).catch(console.error);
      }
    }
  } catch (error) {
    console.error('Error in guildMemberRemove (Invite Logger):', error);
  }
});

client.on('inviteCreate', (invite) => inviteTracker.handleInviteCreate(invite));
client.on('inviteDelete', (invite) => inviteTracker.handleInviteDelete(invite));

// Voice XP & Rewards System
client.on('voiceStateUpdate', async (oldState, newState) => {
  try {
    const settings = await database.getVoiceXPSettings(newState.guild.id);
    if (!settings.enabled) return;

    const userId = newState.member.id;
    const guildId = newState.guild.id;

    // User joined a voice channel
    if (!oldState.channelId && newState.channelId) {
      console.log(`[VoiceXP] ${newState.member.user.tag} joined ${newState.channel.name}`);
      await database.startVoiceSession(userId, guildId, newState.channelId);
    }

    // User left a voice channel
    if (oldState.channelId && !newState.channelId) {
      console.log(`[VoiceXP] ${newState.member.user.tag} left voice. Calculating XP...`);
      const result = await database.endVoiceSession(userId, guildId);
      if (result) {
        console.log(`[VoiceXP] ${newState.member.user.tag} earned ${result.xpEarned.toFixed(2)} XP (${result.duration} min)`);

        // Check for level-up rewards
        if (settings.reward_roles && settings.reward_roles.length > 0) {
          for (const reward of settings.reward_roles) {
            if (result.newLevel >= reward.level) {
              const role = newState.guild.roles.cache.get(reward.role_id);
              if (role && !newState.member.roles.cache.has(role.id)) {
                await newState.member.roles.add(role).catch(err => console.error(`[VoiceXP] Failed to add role: ${err.message}`));
                console.log(`[VoiceXP] Assigned role ${role.name} to ${newState.member.user.tag}`);
              }
            }
          }
        }
      } else {
        console.log(`[VoiceXP] No active session found to end for ${newState.member.user.tag}`);
      }
    }
  } catch (error) {
    console.error('[VoiceXP] Error:', error);
  }
});

client.login(process.env.DISCORD_BOT_TOKEN);

// Export for dashboard
module.exports = {
  client,
  clearPrefixCache
};


