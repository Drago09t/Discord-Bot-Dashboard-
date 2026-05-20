module.exports = {
    name: 'resume',
    description: 'Resumes the music',
    usage: '!resume',
    execute: async (message, args, context) => {
        const { client } = context;
        const state = client.music.getState(message.guild.id);
        if (!state.active) return message.reply('❌ There is no music playing!');

        if (!state.paused) {
            return message.reply('▶️ The music is already playing!');
        }

        await client.music.pause(message.guild.id); // Toggle back to playing
        message.reply('▶️ Resumed the music!');
    }
};
