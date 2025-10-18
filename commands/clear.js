module.exports = {
    data: {
      name: 'clear',
      description: 'Delete a number of recent messages in this channel',
      options: [
        {
          name: 'amount',
          type: 'INTEGER',
          description: 'Number of messages to delete (1–100)',
          required: true
        }
      ]
    },
  
    async execute(interaction) {
      const amount = interaction.options.getInteger('amount');
      const ownerId = 'test';
  
      if (
        interaction.user.id !== ownerId &&
        !interaction.member.permissions.has('MANAGE_MESSAGES')
      ) {
        return interaction.reply({
          content: '❌ You don’t have permission to use this command.',
          ephemeral: true
        });
      }
  
      if (amount < 1 || amount > 100) {
        return interaction.reply({
          content: '⚠️ You must specify a number between 1 and 100.',
          ephemeral: true
        });
      }
  
      try {
        const deleted = await interaction.channel.bulkDelete(amount, true);
        await interaction.reply({
          content: `✅ Deleted **${deleted.size}** message(s).`,
          ephemeral: true
        });
      } catch (err) {
        console.error('Clear command error:', err);
        await interaction.reply({
          content: '❌ Failed to delete messages. They may be older than 14 days.',
          ephemeral: true
        });
      }
    }
  };
  
