module.exports = {
    name: 'volume',
    description: 'Sets the music volume (0-100)',
    usage: '!volume <number>',
    execute: async (message, args, context) => {
        const { client } = context;
        const state = client.music.getState(message.guild.id);
        if (!state.active) return message.reply('❌ There is no music playing!');

        const volume = parseInt(args[0]);
        if (isNaN(volume) || volume < 0 || volume > 150) return message.reply('❌ Please enter a valid number between 0 and 150');

        await client.music.setVolume(message.guild.id, volume);
        message.reply(`🔊 Volume set to \`${volume}%\``);
    }
};
