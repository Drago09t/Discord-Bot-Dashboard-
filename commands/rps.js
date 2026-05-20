const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'rps',
    description: 'Play rock, paper, scissors against the bot',
    usage: '!rps <rock|paper|scissors>',
    execute: async (message, args) => {
        if (args.length === 0) {
            return message.reply('Please choose rock, paper, or scissors! Usage: `!rps <choice>`\nExample: `!rps rock`');
        }

        const choices = ['rock', 'paper', 'scissors'];
        const userChoice = args[0].toLowerCase();

        if (!choices.includes(userChoice)) {
            return message.reply('❌ Invalid choice! Please choose **rock**, **paper**, or **scissors**.');
        }

        const botChoice = choices[Math.floor(Math.random() * choices.length)];

        const emojis = {
            rock: '🪨',
            paper: '📄',
            scissors: '✂️'
        };

        let result;
        let color;

        if (userChoice === botChoice) {
            result = "It's a tie!";
            color = '#FFA500';
        } else if (
            (userChoice === 'rock' && botChoice === 'scissors') ||
            (userChoice === 'paper' && botChoice === 'rock') ||
            (userChoice === 'scissors' && botChoice === 'paper')
        ) {
            result = 'You win! 🎉';
            color = '#00ff00';
        } else {
            result = 'I win! 😎';
            color = '#ff0000';
        }

        const embed = new EmbedBuilder()
            .setColor(color)
            .setTitle('✊✋✌️ Rock Paper Scissors')
            .addFields(
                { name: '👤 Your Choice', value: `${emojis[userChoice]} **${userChoice.charAt(0).toUpperCase() + userChoice.slice(1)}**`, inline: true },
                { name: '🤖 Bot Choice', value: `${emojis[botChoice]} **${botChoice.charAt(0).toUpperCase() + botChoice.slice(1)}**`, inline: true },
                { name: '\u200b', value: '\u200b', inline: true },
                { name: '🏆 Result', value: `**${result}**`, inline: false }
            )
            .setFooter({
                text: `Played by ${message.author.username}`,
                iconURL: message.author.displayAvatarURL()
            })
            .setTimestamp();

        await message.reply({ embeds: [embed] });
    },
};
