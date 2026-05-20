module.exports = {
    name: 'queue',
    description: 'Displays the current music queue',
    usage: '!queue',
    execute: async (message, args, context) => {
        const { client } = context;

        if (!client.music) {
            return message.reply('❌ Music system is not available.');
        }

        const queue = client.music.getQueue(message.guild.id);

        if (!queue || queue.length === 0) {
            return message.reply('📭 The queue is currently empty.');
        }

        const state = client.music.getState(message.guild.id);
        let queueText = `**🎵 Current Queue for ${message.guild.name}**\n\n`;

        if (state.current) {
            queueText += `**Now Playing:**\n${state.current.title} - ${state.current.author}\n\n`;
        }

        queueText += `**Up Next:**\n`;
        queue.slice(1, 11).forEach((track, i) => {
            queueText += `${i + 1}. ${track.title} - ${track.author}\n`;
        });

        if (queue.length > 11) {
            queueText += `\n...and ${queue.length - 11} more tracks`;
        }

        message.reply(queueText);
    }
};
