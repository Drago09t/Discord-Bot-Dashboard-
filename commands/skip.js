module.exports = {
    name: 'skip',
    description: 'Skips the current song',
    usage: '!skip',
    execute: async (message, args, context) => {
        const { client } = context;
        const state = client.music.getState(message.guild.id);
        const queue = client.music.getQueue(message.guild.id);
        if (!state.active) return message.reply('❌ There is no music playing!');
        try {
            if (queue.length <= 1) {
                await client.music.stop(message.guild.id);
                return message.reply('⏭️ Skipped! (No more songs in queue)');
            }
            await client.music.skip(message.guild.id);
            message.reply(`⏭️ Skipped!`);
        } catch (e) {
            message.reply(`❌ Error: ${e.message}`);
        }
    }
};
