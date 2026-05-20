const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: '8ball',
    description: 'Ask the magic 8-ball a question',
    usage: '!8ball <question>',
    execute: async (message, args) => {
        if (args.length === 0) {
            return message.reply('Please ask a question! Usage: `!8ball <question>`\nExample: `!8ball Will I win the lottery?`');
        }

        const question = args.join(' ');

        const responses = {
            positive: [
                'It is certain.', 'It is decidedly so.', 'Without a doubt.',
                'Yes definitely.', 'You may rely on it.', 'As I see it, yes.',
                'Most likely.', 'Outlook good.', 'Yes.', 'Signs point to yes.'
            ],
            neutral: [
                'Reply hazy, try again.', 'Ask again later.', 'Better not tell you now.',
                'Cannot predict now.', 'Concentrate and ask again.'
            ],
            negative: [
                "Don't count on it.", 'My reply is no.', 'My sources say no.',
                'Outlook not so good.', 'Very doubtful.'
            ]
        };

        const allResponses = [...responses.positive, ...responses.neutral, ...responses.negative];
        const answer = allResponses[Math.floor(Math.random() * allResponses.length)];

        let color = '#cccccc';
        if (responses.positive.includes(answer)) color = '#00ff00';
        else if (responses.negative.includes(answer)) color = '#ff0000';

        const embed = new EmbedBuilder()
            .setColor(color)
            .setTitle('🎱 Magic 8-Ball')
            .addFields(
                { name: '❓ Question', value: question, inline: false },
                { name: '🔮 Answer', value: `**${answer}**`, inline: false }
            )
            .setFooter({
                text: `Asked by ${message.author.username}`,
                iconURL: message.author.displayAvatarURL()
            })
            .setTimestamp();

        await message.reply({ embeds: [embed] });
    },
};
