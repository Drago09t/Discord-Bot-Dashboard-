module.exports = {
    name: 'loop',
    description: 'Toggles repeat mode',
    usage: '!loop <off|song|queue>',
    execute: async (message, args, context) => {
        const { client } = context;
        const state = client.music.getState(message.guild.id);
        if (!state.active) return message.reply('❌ There is no music playing!');

        let mode = args[0]?.toLowerCase();
        if (!['off', 'track', 'queue'].includes(mode)) {
            // Toggle
            const currentMode = state.loop;
            if (currentMode === 'off') mode = 'track';
            else if (currentMode === 'track') mode = 'queue';
            else mode = 'off';
        }

        await client.music.setLoop(message.guild.id, mode);
        message.reply(`🔁 Repeat mode set to \`${mode}\``);
    }
};
