const getCommands = require('./commands');
const moderationDB = require('./moderationDB');

async function handleSlashCommand(interaction, client, conversationHistory, PREFIX) {
  const commands = getCommands(client, conversationHistory, PREFIX);

  const commandName = interaction.commandName;
  const command = commands[commandName];

  if (!command) {
    return interaction.reply({
      content: 'Unknown command.',
      ephemeral: true
    });
  }

  // Moderation Check
  try {
    const setting = await moderationDB.getCommandSetting(interaction.guildId, commandName);
    if (setting) {
      if (setting.enabled === false) {
        return interaction.reply({ content: '❌ This command is currently disabled by server administrators.', ephemeral: true });
      }
      if (setting.allowed_roles && setting.allowed_roles.length > 0) {
        const hasRole = interaction.member.roles.cache.some(r => setting.allowed_roles.includes(r.id));
        if (!hasRole) {
          return interaction.reply({ content: '❌ You do not have the required role to use this command.', ephemeral: true });
        }
      }
    }
  } catch (err) {
    console.error(`Error checking moderation settings for ${commandName}:`, err);
  }

  try {
    const mockMessage = {
      author: interaction.user,
      channel: interaction.channel,
      guild: interaction.guild,
      member: interaction.member,
      mentions: {
        users: new Map(),
        has: (user) => false
      },
      reply: async (options) => {
        if (typeof options === 'string') {
          return interaction.reply({ content: options });
        }
        return interaction.reply(options);
      },
      client: client
    };

    const args = [];

    switch (commandName) {
      case 'translate':
        if (interaction.options.getString('language')) {
          args.push(interaction.options.getString('language'));
        }
        if (interaction.options.getString('text')) {
          args.push(...interaction.options.getString('text').split(' '));
        }
        break;

      case 'summarize':
      case 'improve':
      case 'analyze':
        if (interaction.options.getString('text')) {
          args.push(...interaction.options.getString('text').split(' '));
        }
        break;

      case 'code':
        if (interaction.options.getString('language')) {
          args.push(interaction.options.getString('language'));
        }
        if (interaction.options.getString('request')) {
          args.push(...interaction.options.getString('request').split(' '));
        }
        break;

      case 'brainstorm':
        if (interaction.options.getString('topic')) {
          args.push(...interaction.options.getString('topic').split(' '));
        }
        break;

      case 'persona':
        if (interaction.options.getString('personality')) {
          args.push(...interaction.options.getString('personality').split(' '));
        }
        break;

      case 'ask':
        if (interaction.options.getString('question')) {
          args.push(...interaction.options.getString('question').split(' '));
        }
        break;

      case 'explain':
        if (interaction.options.getString('topic')) {
          args.push(...interaction.options.getString('topic').split(' '));
        }
        break;

      case 'debate':
        if (interaction.options.getString('topic')) {
          args.push(...interaction.options.getString('topic').split(' '));
        }
        break;

      case 'creative':
        if (interaction.options.getString('type')) {
          args.push(interaction.options.getString('type'));
        }
        if (interaction.options.getString('prompt')) {
          args.push(...interaction.options.getString('prompt').split(' '));
        }
        break;

      case 'fact':
        if (interaction.options.getString('topic')) {
          args.push(...interaction.options.getString('topic').split(' '));
        }
        break;

      case 'compare':
        if (interaction.options.getString('items')) {
          args.push(...interaction.options.getString('items').split(' '));
        }
        break;

      case 'quiz':
        if (interaction.options.getString('topic')) {
          args.push(...interaction.options.getString('topic').split(' '));
        }
        if (interaction.options.getString('difficulty')) {
          args.push(interaction.options.getString('difficulty'));
        }
        break;

      case 'define':
        if (interaction.options.getString('term')) {
          args.push(...interaction.options.getString('term').split(' '));
        }
        break;

      case 'setup':
        if (interaction.options.getChannel('channel')) {
          args.push(interaction.options.getChannel('channel').id);
        }
        break;

      case 'listai':
        // No args needed
        break;

      case 'removeai':
        if (interaction.options.getChannel('channel')) {
          args.push(interaction.options.getChannel('channel').id);
        }
        break;

      case 'voice24':
      case 'voicestop':
      case 'voicejoin':
        if (interaction.options.getChannel('channel')) {
          args.push(interaction.options.getChannel('channel').id);
        }
        break;

      case 'voicelist':
      case 'voiceleave':
        // No args needed
        break;
    }

    await interaction.deferReply();

    mockMessage.reply = async (options) => {
      if (typeof options === 'string') {
        return interaction.editReply({ content: options });
      }
      return interaction.editReply(options);
    };

    await command.execute(mockMessage, args);

  } catch (error) {
    console.error(`Error executing slash command ${commandName}:`, error);

    const errorMessage = {
      content: 'An error occurred while executing this command.',
      ephemeral: true
    };

    if (interaction.deferred) {
      await interaction.editReply(errorMessage).catch(console.error);
    } else {
      await interaction.reply(errorMessage).catch(console.error);
    }
  }
}

module.exports = { handleSlashCommand };
