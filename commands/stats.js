const { MessageEmbed } = require("discord.js");
const fs = require("fs");
const path = require("path");

const pointsFile = path.join(__dirname, "../points.json");

function loadPoints() {
  try {
    const data = fs.readFileSync(pointsFile, "utf8");
    return JSON.parse(data || "{}");
  } catch {
    return {};
  }
}

function getUserData(userId) {
  const points = loadPoints();
  if (!points[userId]) {
    points[userId] = { points: 0, wins: 0, losses: 0, dailyChange: 0 };
  }
  return points[userId];
}

module.exports = {
  data: {
    name: "userstats",
    description: "Check a user's statistics",
    options: [
      {
        name: "user",
        type: "USER",
        description: "The user to check (leave empty for yourself)",
        required: false
      }
    ]
  },

  async execute(interaction) {
    const target = interaction.options.getUser("user") || interaction.user;
    const data = getUserData(target.id);

    const winRate =
      data.wins + data.losses > 0
        ? ((data.wins / (data.wins + data.losses)) * 100).toFixed(0)
        : 0;

    const embed = new MessageEmbed()
      .setColor("#e74c3c")
      .setTitle("📊 Overall User Statistics")
      .setDescription(`>>> Displaying overall statistics for ${target}.`)
      .setThumbnail(target.displayAvatarURL({ dynamic: true }))
      .addFields(
        {
          name: "Points",
          value: `${data.points} pts`,
          inline: true
        },
        {
          name: "Daily Change",
          value: `${data.dailyChange >= 0 ? "📈" : "📉"} ${data.dailyChange} pts`,
          inline: true
        },
        {
          name: "Matches",
          value: `W: ${data.wins} (${winRate}%)\nL: ${data.losses}`,
          inline: true
        }
      )
      .setFooter({
        text: "Developed By Sync Studios"
      });

    await interaction.reply({ embeds: [embed] });
  }
};
