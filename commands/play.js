const voiceManager = require('../voiceManager');

module.exports = {
    name: 'play',
    description: 'Plays a song from YouTube',
    usage: '!play <url or query>',
    execute: async (message, args, context) => {
        const { client } = context;
        const voiceChannel = message.member.voice.channel;
        if (!voiceChannel) return message.reply('❌ You need to be in a voice channel!');
        const query = args.join(' ');
        if (!query) return message.reply('❌ Please provide a link or search query.');

        try {
            // Use new Shoukaku music system (handles cleanup internally)
            if (!client.music) {
                return message.reply('❌ Music system is not available.');
            }

            const result = await client.music.play(
                message.guild.id,
                voiceChannel.id,
                query,
                message.author.id
            );

            message.reply(`🎵 **Now playing:** ${result.first.title}`);
        } catch (e) {
            console.error(e);
            message.reply(`❌ Error: ${e.message}`);
        }
    }
};
