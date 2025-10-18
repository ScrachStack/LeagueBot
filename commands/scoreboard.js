const { MessageEmbed } = require("discord.js");
const fs = require("fs");
const path = require("path");

const pointsFile = path.join(__dirname, "../points.json");

function getPointsData() {
  if (!fs.existsSync(pointsFile)) return {};
  return JSON.parse(fs.readFileSync(pointsFile));
}

module.exports = {
  data: {
    name: "scoreboard",
    description: "Show the top 10 players with the highest points"
  },

  async execute(interaction) {
    const guild = interaction.guild;
    const pointsData = getPointsData();

    const sorted = Object.entries(pointsData)
      .sort((a, b) => b[1].points - a[1].points)
      .slice(0, 10);

    if (sorted.length === 0) {
      return interaction.reply({
        content: "⚠️ No players have points yet.",
        ephemeral: true
      });
    }

    let desc = "";
    let rank = 1;
    for (const [userId, data] of sorted) {
      const member = await guild.members.fetch(userId).catch(() => null);
      const name = member ? member.displayName : `Unknown (${userId})`;

      desc += `**#${rank}** ${name} — **${data.points} pts**\n`;
      rank++;
    }

    const embed = new MessageEmbed()
      .setColor("#3498db")
      .setTitle("🏅 Top 10 Scoreboard")
      .setDescription(desc)
      .setTimestamp();

    return interaction.reply({ embeds: [embed] });
  }
};
