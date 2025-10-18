const { MessageEmbed } = require('discord.js');

module.exports = {
  data: {
    name: 'embedbuilder',
    description: 'Interactively build a custom embed'
  },

  async execute(interaction) {
    if (!interaction.member.permissions.has('MANAGE_MESSAGES')) {
      return interaction.reply({
        content: '❌ You need the `Manage Messages` permission to use this command.',
        ephemeral: true
      });
    }

    await interaction.reply({
      content: '📨 Let’s build your embed! I’ll ask you for the title, description, and color.',
      ephemeral: true
    });

    const filter = m => m.author.id === interaction.user.id;

    const ask = async (question) => {
      await interaction.channel.send(question);
      const collected = await interaction.channel.awaitMessages({ filter, max: 1, time: 60000 });
      return collected.first()?.content;
    };

    try {
      const title = await ask('📝 What should the **embed title** be?');
      const description = await ask('💬 What should the **embed description** be?');
      const color = await ask('🎨 Enter a **hex color code** (like `#00BFFF`) or type `default`:');

      const embed = new MessageEmbed()
        .setTitle(title || 'Untitled')
        .setDescription(description || 'No description provided.')
        .setColor(/^#[0-9A-F]{6}$/i.test(color) ? color : '#00BFFF')
        .setFooter(`Created by ${interaction.user.tag}`, interaction.user.displayAvatarURL({ dynamic: true }))
        .setTimestamp();

      await interaction.channel.send({ embeds: [embed] });

    } catch (err) {
      console.error('Embed builder error:', err);
      await interaction.channel.send('❌ Something went wrong or you took too long.');
    }
  }
};
