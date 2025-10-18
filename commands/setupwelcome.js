const fs = require('fs');
const path = require('path');
const configPath = path.resolve(__dirname, '../config.json');

module.exports = {
  data: {
    name: 'setupwelcome',
    description: 'Setup welcome message for your server',
    options: [
      {
        name: 'channel',
        type: 'CHANNEL',
        description: 'The channel to send welcome messages in',
        required: true
      },
      {
        name: 'message',
        type: 'STRING',
        description: 'The welcome message (use ${member.id}, ${member.tag}, etc.)',
        required: true
      }
    ]
  },

  async execute(interaction) {
    if (
        interaction.user.id !== '291201172180697089' && 
        !interaction.member.permissions.has('ADMINISTRATOR')
      ) {
        return interaction.reply({ content: '❌ You must be an admin to use this.', ephemeral: true });
      }
      

    const channel = interaction.options.getChannel('channel');
    const message = interaction.options.getString('message');
    const guildId = interaction.guild.id;

    let config = {};
    if (fs.existsSync(configPath)) {
      config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    }

    config[guildId] = {
      channel: channel.id,
      message
    };

    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

    interaction.reply({
      content: `✅ Welcome system set! Messages will go to <#${channel.id}> with:\n\n\`\`\`${message}\`\`\``,
      ephemeral: true
    });
  }
};
