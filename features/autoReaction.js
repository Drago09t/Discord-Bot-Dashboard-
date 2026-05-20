const supabaseDB = require('../supabaseDB');

async function handleAutoReaction(message) {
    if (!message.guild || message.author.bot) return;

    try {
        const reactions = await supabaseDB.getAutoReactions(message.guild.id);
        if (!reactions || reactions.length === 0) return;

        const content = message.content.toLowerCase();
        for (const { keyword, emoji } of reactions) {
            if (content.includes(keyword)) {
                await message.react(emoji).catch(() => { });
            }
        }
    } catch (error) {
        console.error('Auto-reaction error:', error);
    }
}

module.exports = { handleAutoReaction };
