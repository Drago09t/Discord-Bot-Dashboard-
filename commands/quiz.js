const { EmbedBuilder } = require('discord.js');
const { GoogleGenerativeAI } = require('@google/generative-ai');

module.exports = {
    name: 'quiz',
    description: 'Generate quiz questions on any topic',
    usage: '!quiz <topic> [difficulty]',
    execute: async (message, args) => {
        if (args.length === 0) {
            return message.reply(`Please provide a topic! Usage: \`!quiz <topic> [difficulty]\`

**Difficulty levels:** easy, medium, hard (default: medium)
Example: \`!quiz JavaScript hard\``);
        }

        let difficulty = 'medium';
        const validDifficulties = ['easy', 'medium', 'hard'];

        const lastArg = args[args.length - 1].toLowerCase();
        if (validDifficulties.includes(lastArg)) {
            difficulty = lastArg;
            args.pop();
        }

        const topic = args.join(' ');

        try {
            await message.channel.sendTyping();

            const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
            const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

            const prompt = `Generate 5 ${difficulty} quiz questions about: ${topic}

Format each question as:
**Question X:** [Question text]
A) [Option A]
B) [Option B]
C) [Option C]
D) [Option D]
||**Answer:** [Correct answer with brief explanation]||

Use Discord spoiler tags (||text||) for answers so users can try first!
Make questions challenging but fair for ${difficulty} difficulty.`;

            const result = await model.generateContent(prompt);
            const quiz = result.response.text();

            const difficultyEmojis = {
                easy: '🟢',
                medium: '🟡',
                hard: '🔴'
            };

            if (quiz.length > 1900) {
                const chunks = [];
                let currentChunk = '';
                const lines = quiz.split('\n');

                for (const line of lines) {
                    if ((currentChunk + line + '\n').length > 1800) {
                        if (currentChunk) chunks.push(currentChunk.trim());
                        currentChunk = line + '\n';
                    } else {
                        currentChunk += line + '\n';
                    }
                }
                if (currentChunk) chunks.push(currentChunk.trim());

                for (let i = 0; i < chunks.length; i++) {
                    const embed = new EmbedBuilder()
                        .setColor(difficulty === 'easy' ? '#2ECC71' : difficulty === 'medium' ? '#F39C12' : '#E74C3C')
                        .setTitle(i === 0 ? `${difficultyEmojis[difficulty]} Quiz: ${topic} (${difficulty.toUpperCase()})` : `${difficultyEmojis[difficulty]} Quiz (${i + 1}/${chunks.length})`)
                        .setDescription(chunks[i])
                        .setFooter({
                            text: `Requested by ${message.author.username} • Click spoilers to reveal answers`,
                            iconURL: message.author.displayAvatarURL()
                        })
                        .setTimestamp();

                    await message.reply({ embeds: [embed] });
                    if (i < chunks.length - 1) {
                        await new Promise(resolve => setTimeout(resolve, 500));
                    }
                }
            } else {
                const embed = new EmbedBuilder()
                    .setColor(difficulty === 'easy' ? '#2ECC71' : difficulty === 'medium' ? '#F39C12' : '#E74C3C')
                    .setTitle(`${difficultyEmojis[difficulty]} Quiz: ${topic} (${difficulty.toUpperCase()})`)
                    .setDescription(quiz)
                    .setFooter({
                        text: `Requested by ${message.author.username} • Click spoilers to reveal answers`,
                        iconURL: message.author.displayAvatarURL()
                    })
                    .setTimestamp();

                await message.reply({ embeds: [embed] });
            }
        } catch (error) {
            console.error('Quiz error:', error);
            await message.reply('❌ Failed to generate quiz. Please try again.');
        }
    },
};
