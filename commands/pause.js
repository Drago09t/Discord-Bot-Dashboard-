module.exports = {
    name: 'pause',
    description: 'Pauses the music',
    usage: '!pause',
    execute: async (message, args, context) => {
        const { client } = context;
        const state = client.music.getState(message.guild.id);
        if (!state.active) return message.reply('❌ There is no music playing!');

        if (state.paused) {
            return message.reply('⏸️ The music is already paused!');
        }

        await client.music.pause(message.guild.id);
        message.reply('⏸️ Paused the music!');
    }
};
