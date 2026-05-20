const supabaseDB = require('../supabaseDB');

async function handleAFK(message) {
    if (!message.guild || message.author.bot) return;

    // 1. Remove AFK if user speaks
    const isAFK = await supabaseDB.isAFK(message.author.id, message.guild.id);
    if (isAFK) {
        await supabaseDB.removeAFK(message.author.id, message.guild.id);
        const reply = await message.reply("👋 Welcome back! I've removed your AFK status.");
        setTimeout(() => reply.delete().catch(() => { }), 5000);
    }

    // 2. Check mentions for AFK users
    if (message.mentions.users.size > 0) {
        for (const [userId, user] of message.mentions.users) {
            const afkData = await supabaseDB.getAFK(userId, message.guild.id);
            if (afkData) {
                const duration = Math.floor((Date.now() - afkData.timestamp) / 60000);
                const durationStr = duration > 0 ? `${duration}m ago` : 'just now';

                await message.reply({
                    content: `💤 **${user.username}** is currently AFK: ${afkData.message} (${durationStr})`,
                    allowedMentions: { repliedUser: false }
                });
            }
        }
    }
}

async function setAFKStatus(message, afkMessage = 'AFK') {
    await supabaseDB.setAFK(message.author.id, message.guild.id, afkMessage);
    await message.reply(`✅ I've set your AFK: **${afkMessage}**`);
}

module.exports = { handleAFK, setAFKStatus };
