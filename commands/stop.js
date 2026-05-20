module.exports = {
    name: 'stop',
    description: 'Stops the music and leaves the channel',
    usage: '!stop',
    execute: async (message, args, context) => {
        const { client } = context;
        const state = client.music.getState(message.guild.id);
        if (!state.active) return message.reply('❌ There is no music playing!');
        try {
            await client.music.stop(message.guild.id);
            message.reply('🛑 Stopped and cleared the queue.');
        } catch (e) {
            message.reply(`❌ Error: ${e.message}`);
        }
    }
};
