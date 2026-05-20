const fs = require('fs');
const path = require('path');

const getCommands = (client, conversationHistory, PREFIX) => {
  const commands = {};
  const commandsPath = path.join(__dirname, 'commands');
  const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    commands[command.name] = {
      description: command.description,
      usage: command.usage,
      execute: async (message, args) => {
        const context = {
          client,
          conversationHistory,
          PREFIX,
          allCommands: commands
        };
        return command.execute(message, args, context);
      }
    };
  }

  return commands;
};

module.exports = getCommands;
