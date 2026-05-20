require('dotenv').config();
const { REST, Routes, SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

const commands = [
  new SlashCommandBuilder()
    .setName('help')
    .setDescription('Show all available AI commands'),

  new SlashCommandBuilder()
    .setName('clear')
    .setDescription('Clear your conversation history with the bot'),

  new SlashCommandBuilder()
    .setName('history')
    .setDescription('Show your conversation history count'),

  new SlashCommandBuilder()
    .setName('translate')
    .setDescription('Translate text to another language')
    .addStringOption(option =>
      option.setName('language')
        .setDescription('Target language')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('text')
        .setDescription('Text to translate')
        .setRequired(true)),

  new SlashCommandBuilder()
    .setName('summarize')
    .setDescription('Summarize long text into key points')
    .addStringOption(option =>
      option.setName('text')
        .setDescription('Text to summarize')
        .setRequired(true)),

  new SlashCommandBuilder()
    .setName('code')
    .setDescription('Generate or explain code')
    .addStringOption(option =>
      option.setName('language')
        .setDescription('Programming language')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('request')
        .setDescription('Code description or code to explain')
        .setRequired(true)),

  new SlashCommandBuilder()
    .setName('improve')
    .setDescription('Improve and enhance text')
    .addStringOption(option =>
      option.setName('text')
        .setDescription('Text to improve')
        .setRequired(true)),

  new SlashCommandBuilder()
    .setName('brainstorm')
    .setDescription('Generate creative ideas about a topic')
    .addStringOption(option =>
      option.setName('topic')
        .setDescription('Topic to brainstorm about')
        .setRequired(true)),

  new SlashCommandBuilder()
    .setName('persona')
    .setDescription('Set AI personality for your conversations')
    .addStringOption(option =>
      option.setName('personality')
        .setDescription('AI personality (use "reset" to reset)')
        .setRequired(false)),

  new SlashCommandBuilder()
    .setName('analyze')
    .setDescription('Analyze text sentiment and tone')
    .addStringOption(option =>
      option.setName('text')
        .setDescription('Text to analyze')
        .setRequired(true)),

  new SlashCommandBuilder()
    .setName('ask')
    .setDescription('Ask AI a specific question')
    .addStringOption(option =>
      option.setName('question')
        .setDescription('Your question')
        .setRequired(true)),

  new SlashCommandBuilder()
    .setName('explain')
    .setDescription('Explain complex topics in simple terms')
    .addStringOption(option =>
      option.setName('topic')
        .setDescription('Topic to explain')
        .setRequired(true)),

  new SlashCommandBuilder()
    .setName('debate')
    .setDescription('AI presents multiple perspectives on a topic')
    .addStringOption(option =>
      option.setName('topic')
        .setDescription('Topic to debate')
        .setRequired(true)),

  new SlashCommandBuilder()
    .setName('creative')
    .setDescription('Generate creative content (stories, poems, ideas, etc.)')
    .addStringOption(option =>
      option.setName('type')
        .setDescription('Type of content')
        .setRequired(true)
        .addChoices(
          { name: 'Story', value: 'story' },
          { name: 'Poem', value: 'poem' },
          { name: 'Ideas', value: 'idea' },
          { name: 'Dialogue', value: 'dialogue' },
          { name: 'Joke', value: 'joke' },
          { name: 'Lyrics', value: 'lyrics' }
        ))
    .addStringOption(option =>
      option.setName('prompt')
        .setDescription('Creative prompt')
        .setRequired(true)),

  new SlashCommandBuilder()
    .setName('fact')
    .setDescription('Get interesting facts about any topic')
    .addStringOption(option =>
      option.setName('topic')
        .setDescription('Topic to get facts about')
        .setRequired(true)),

  new SlashCommandBuilder()
    .setName('compare')
    .setDescription('Compare two or more things with AI analysis')
    .addStringOption(option =>
      option.setName('items')
        .setDescription('Items to compare (use "vs" between items)')
        .setRequired(true)),

  new SlashCommandBuilder()
    .setName('quiz')
    .setDescription('Generate quiz questions on any topic')
    .addStringOption(option =>
      option.setName('topic')
        .setDescription('Topic for quiz')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('difficulty')
        .setDescription('Difficulty level')
        .setRequired(false)
        .addChoices(
          { name: 'Easy', value: 'easy' },
          { name: 'Medium', value: 'medium' },
          { name: 'Hard', value: 'hard' }
        )),

  new SlashCommandBuilder()
    .setName('define')
    .setDescription('Define technical or complex terms')
    .addStringOption(option =>
      option.setName('term')
        .setDescription('Term to define')
        .setRequired(true)),

  new SlashCommandBuilder()
    .setName('setup')
    .setDescription('Setup an AI channel for automated AI conversations (Admin only)')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('Channel to set up as AI channel (leave empty for current channel)')
        .setRequired(false)),

  new SlashCommandBuilder()
    .setName('listai')
    .setDescription('List all AI channels in this server (Admin only)')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  new SlashCommandBuilder()
    .setName('removeai')
    .setDescription('Remove AI channel designation (Admin only)')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('Channel to remove AI designation from (leave empty for current channel)')
        .setRequired(false)),

  new SlashCommandBuilder()
    .setName('voice24')
    .setDescription('Enable 24/7 voice connection in a voice channel (Admin only)')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('Voice channel for 24/7 connection (leave empty for your current voice)')
        .setRequired(false)),

  new SlashCommandBuilder()
    .setName('voicestop')
    .setDescription('Disable 24/7 voice and disconnect (Admin only)')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('Voice channel to stop (leave empty to stop current)')
        .setRequired(false)),

  new SlashCommandBuilder()
    .setName('voicelist')
    .setDescription('List all 24/7 voice connections (Admin only)')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  new SlashCommandBuilder()
    .setName('voicejoin')
    .setDescription('Manually join a voice channel - temporary, not 24/7 (Admin only)')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('Voice channel to join (leave empty for your current voice)')
        .setRequired(false)),

  new SlashCommandBuilder()
    .setName('voiceleave')
    .setDescription('Manually leave current voice channel (Admin only)')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
].map(command => command.toJSON());

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_BOT_TOKEN);

(async () => {
  try {
    console.log('Started refreshing application (/) commands.');

    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: commands },
    );

    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error('Error deploying commands:', error);
  }
})();
