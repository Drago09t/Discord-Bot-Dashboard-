const supabaseDB = require('../supabaseDB');

async function handleActivityMapping(message) {
    if (!message.guild || message.author.bot) return;

    await supabaseDB.trackActivity(
        message.guild.id,
        message.author.id,
        message.channel.id
    );
}

module.exports = { handleActivityMapping };
