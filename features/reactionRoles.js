const supabaseDB = require('../supabaseDB');

async function handleReactionRole(reaction, user, type) {
    if (user.bot) return;

    // Handle partials
    if (reaction.partial) {
        try {
            await reaction.fetch();
        } catch (error) {
            console.error('Something went wrong when fetching the message:', error);
            return;
        }
    }

    const { message, emoji } = reaction;
    const guildId = message.guild?.id;
    if (!guildId) return;

    try {
        const reactionRoles = await supabaseDB.getReactionRoles(guildId);

        // Find if this reaction matches any rule
        const rule = reactionRoles.find(r =>
            r.message_id === message.id &&
            (r.emoji === emoji.name || r.emoji === emoji.id || r.emoji === `<:${emoji.name}:${emoji.id}>`)
        );

        if (rule) {
            const member = await message.guild.members.fetch(user.id);
            const role = message.guild.roles.cache.get(rule.role_id);

            if (role && role.editable) {
                if (type === 'add') {
                    await member.roles.add(role).catch(() => null);
                } else if (type === 'remove') {
                    await member.roles.remove(role).catch(() => null);
                }
            }
        }
    } catch (error) {
        console.error('Reaction role error:', error);
    }
}

module.exports = { handleReactionRole };
