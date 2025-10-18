const { Modal, TextInputComponent, MessageActionRow } = require("discord.js");
const fs = require("fs");
const path = require("path");


module.exports = {
  data: {
    name: "nickname",
    description: "Set your custom nickname with points in front"
  },

  async execute(interaction) {
    const modal = new Modal()
      .setCustomId("nicknameModal")
      .setTitle("Set Your Nickname");

    const nicknameInput = new TextInputComponent()
      .setCustomId("nicknameInput")
      .setLabel("Enter your nickname")
      .setStyle("SHORT")
      .setMaxLength(32)
      .setRequired(true);

    const row = new MessageActionRow().addComponents(nicknameInput);
    modal.addComponents(row);

    await interaction.showModal(modal);
  }
};
