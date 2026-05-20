const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  name: 'help',
  description: 'Show all available AI commands',
  usage: '!help',
  execute: async (message, args, { client, PREFIX, allCommands }) => {
    const categories = {
      general: {
        emoji: '📚',
        label: 'General',
        color: '#2b2d31',
        colorCode: '\x1b[1;36m',
        commands: [
          { emoji: '📋', name: 'help', cmd: allCommands.help },
        ]
      },
      user: {
        emoji: '👤',
        label: 'User',
        color: '#00aa00',
        colorCode: '\x1b[1;32m',
        commands: [
          { emoji: '🗑️', name: 'clear', cmd: allCommands.clear },
          { emoji: '📝', name: 'history', cmd: allCommands.history },
        ]
      },
      ai: {
        emoji: '🤖',
        label: 'AI Tools',
        color: '#00ffaa',
        colorCode: '\x1b[1;36m',
        commands: [
          { emoji: '🌐', name: 'translate', cmd: allCommands.translate },
          { emoji: '📄', name: 'summarize', cmd: allCommands.summarize },
          { emoji: '💻', name: 'code', cmd: allCommands.code },
          { emoji: '✨', name: 'improve', cmd: allCommands.improve },
          { emoji: '💡', name: 'brainstorm', cmd: allCommands.brainstorm },
          { emoji: '🎭', name: 'persona', cmd: allCommands.persona },
          { emoji: '📊', name: 'analyze', cmd: allCommands.analyze },
          { emoji: '❓', name: 'ask', cmd: allCommands.ask },
        ]
      },
      advanced: {
        emoji: '✨',
        label: 'Advanced AI',
        color: '#9B59B6',
        colorCode: '\x1b[1;35m',
        commands: [
          { emoji: '📚', name: 'explain', cmd: allCommands.explain },
          { emoji: '⚖️', name: 'debate', cmd: allCommands.debate },
          { emoji: '💡', name: 'creative', cmd: allCommands.creative },
          { emoji: '🔍', name: 'fact', cmd: allCommands.fact },
          { emoji: '⚖️', name: 'compare', cmd: allCommands.compare },
          { emoji: '🎯', name: 'quiz', cmd: allCommands.quiz },
          { emoji: '📖', name: 'define', cmd: allCommands.define },
        ]
      },
      fun: {
        emoji: '🎮',
        label: 'Fun & Games',
        color: '#FFD700',
        colorCode: '\x1b[1;33m',
        commands: [
          { emoji: '🎱', name: '8ball', cmd: allCommands['8ball'] },
          { emoji: '🎲', name: 'roll', cmd: allCommands.roll },
          { emoji: '🪙', name: 'coinflip', cmd: allCommands.coinflip },
          { emoji: '✊', name: 'rps', cmd: allCommands.rps },
          { emoji: '😂', name: 'joke', cmd: allCommands.joke },
          { emoji: '🖼️', name: 'meme', cmd: allCommands.meme },
        ]
      },
      utility: {
        emoji: '🛠️',
        label: 'Utility',
        color: '#3498db',
        colorCode: '\x1b[1;34m',
        commands: [
          { emoji: '📊', name: 'serverinfo', cmd: allCommands.serverinfo },
          { emoji: '👤', name: 'userinfo', cmd: allCommands.userinfo },
          { emoji: '🖼️', name: 'avatar', cmd: allCommands.avatar },
          { emoji: '📋', name: 'poll', cmd: allCommands.poll },
          { emoji: '🧮', name: 'calculate', cmd: allCommands.calculate },
          { emoji: '⏰', name: 'reminder', cmd: allCommands.reminder },
          { emoji: '🔍', name: 'search', cmd: allCommands.search },
          { emoji: '💬', name: 'embed', cmd: allCommands.embed },
        ]
      },
      admin: {
        emoji: '🛡️',
        label: 'Admin',
        color: '#e74c3c',
        colorCode: '\x1b[1;31m',
        commands: [
          { emoji: '💬', name: 'setup', cmd: allCommands.setup },
          { emoji: '📋', name: 'listai', cmd: allCommands.listai },
          { emoji: '🗑️', name: 'removeai', cmd: allCommands.removeai },
          { emoji: '🔊', name: 'voice24', cmd: allCommands.voice24 },
          { emoji: '🛑', name: 'voicestop', cmd: allCommands.voicestop },
          { emoji: '📊', name: 'voicelist', cmd: allCommands.voicelist },
          { emoji: '▶️', name: 'voicejoin', cmd: allCommands.voicejoin },
          { emoji: '⏸️', name: 'voiceleave', cmd: allCommands.voiceleave },
        ]
      }
    };

    const getEmbed = (categoryKey) => {
      const category = categories[categoryKey];
      const commandText = category.commands.map(c =>
        `${c.emoji} \`${c.cmd.usage}\`\n└─ ${c.cmd.description}`
      ).join('\n\n');

      return new EmbedBuilder()
        .setColor(category.color)
        .setAuthor({
          name: `${client.user.username} Command Center - ${category.label} Commands`,
          iconURL: client.user.displayAvatarURL()
        })
        .setDescription(`\`\`\`ansi\n${category.colorCode}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\x1b[0m\n\`\`\``)
        .addFields({
          name: `${category.emoji} ${category.label} Commands`,
          value: commandText,
          inline: false
        })
        .setFooter({
          text: `💬 Mention ${client.user.username} for AI conversation | Prefix: ${PREFIX}`,
          iconURL: message.author.displayAvatarURL()
        })
        .setTimestamp();
    };

    const getButtons = (activeCategory) => {
      const row1 = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('help_general')
          .setLabel('General')
          .setStyle(activeCategory === 'general' ? ButtonStyle.Primary : ButtonStyle.Secondary)
          .setEmoji('📚'),
        new ButtonBuilder()
          .setCustomId('help_user')
          .setLabel('User')
          .setStyle(activeCategory === 'user' ? ButtonStyle.Primary : ButtonStyle.Secondary)
          .setEmoji('👤'),
        new ButtonBuilder()
          .setCustomId('help_ai')
          .setLabel('AI Tools')
          .setStyle(activeCategory === 'ai' ? ButtonStyle.Primary : ButtonStyle.Secondary)
          .setEmoji('🤖')
      );

      const row2 = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('help_advanced')
          .setLabel('Advanced AI')
          .setStyle(activeCategory === 'advanced' ? ButtonStyle.Primary : ButtonStyle.Secondary)
          .setEmoji('✨'),
        new ButtonBuilder()
          .setCustomId('help_fun')
          .setLabel('Fun & Games')
          .setStyle(activeCategory === 'fun' ? ButtonStyle.Primary : ButtonStyle.Secondary)
          .setEmoji('🎮'),
        new ButtonBuilder()
          .setCustomId('help_utility')
          .setLabel('Utility')
          .setStyle(activeCategory === 'utility' ? ButtonStyle.Primary : ButtonStyle.Secondary)
          .setEmoji('🛠️')
      );

      const row3 = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('help_admin')
          .setLabel('Admin')
          .setStyle(activeCategory === 'admin' ? ButtonStyle.Primary : ButtonStyle.Secondary)
          .setEmoji('🛡️')
      );

      return [row1, row2, row3];
    };

    let activeCategory = 'ai';
    if (args.length > 0) {
      const arg = args[0].toLowerCase();
      if (categories[arg]) activeCategory = arg;
    }

    const reply = await message.reply({
      embeds: [getEmbed(activeCategory)],
      components: getButtons(activeCategory)
    });

    const collector = reply.createMessageComponentCollector({
      filter: (interaction) => interaction.user.id === message.author.id,
      time: 60000
    });

    collector.on('collect', async (interaction) => {
      const [, category] = interaction.customId.split('_');
      activeCategory = category;

      await interaction.update({
        embeds: [getEmbed(activeCategory)],
        components: getButtons(activeCategory)
      });
    });

    collector.on('end', async () => {
      await reply.edit({ components: [] }).catch(() => { });
    });
  },
};
