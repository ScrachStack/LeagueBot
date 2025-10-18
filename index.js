const { Client, Intents, Collection, MessageActionRow, MessageButton, MessageSelectMenu , Modal, TextInputComponent, MessageEmbed} = require('discord.js');
const fs = require('fs');
global.config = require('./config');
const path = require('path');

const client = new Client({
    intents: [
      Intents.FLAGS.GUILDS,
      Intents.FLAGS.GUILD_MEMBERS, 
      Intents.FLAGS.GUILD_MESSAGES,
    ]
  });
  client.commands = new Collection();

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.data.name, command);
}
const pointsFile = path.join(__dirname, "points.json");

function loadPoints() {
  if (!fs.existsSync(pointsFile)) return {};
  return JSON.parse(fs.readFileSync(pointsFile, "utf8"));
}

function savePoints(data) {
  fs.writeFileSync(pointsFile, JSON.stringify(data, null, 2));
}

function setPoints(userId, points) {
  const data = loadPoints();
  if (!data[userId] || typeof data[userId] !== "object") {
    data[userId] = { points: 0, wins: 0, losses: 0, dailyChange: 0 };
  }
  data[userId].points = points;
  savePoints(data);
  return points;
}

function addPoints(userId, amount) {
  const data = loadPoints(); 
  if (!data[userId] || typeof data[userId] !== "object") {
    data[userId] = { points: 0, wins: 0, losses: 0, dailyChange: 0 };
  }

  const userData = data[userId];
  const newPoints = Math.max(0, userData.points + amount);

  userData.points = newPoints;
  userData.dailyChange += amount;

  savePoints(data);

  return newPoints;
}


client.once('ready', async () => {
    config.guildIds.forEach(guildID => {
        const guild = client.guilds.cache.get(guildID);
        if (guild) {
            console.log(`[Sync Studios]: Commands Loaded In ${guild.name}`);
            client.user.setActivity('League', {
                type: 'WATCHING' // Options: PLAYING, STREAMING, LISTENING, WATCHING, COMPETING
              });
            console.log("[Sync Studios] League Bot: Loading ....")
            console.log("[Sync Studios] Support: https://disboard.org/server/join/1119734000974565439")
            console.log("[Sync Studios] Made By ScratchStack")
            guild.commands.set(Array.from(client.commands.values()).map(cmd => cmd.data)).catch(err => {
                console.error(`[Sync Studios]: Failed to set commands for ${guild.name}:`, err);
            });
        } else {
            console.log(`[Sync Studios]: Guild not found: ${guildID}`);
        }
    });
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;
    const command = client.commands.get(interaction.commandName);
    if (!command) return;
    try {
        await command.execute(interaction, client);
    } catch (error) {
        console.error(error);
        await interaction.reply({ content: 'An error occurred while executing this command!', ephemeral: true });
    }
});

const configPath = path.resolve(__dirname, './config.json');

  
  client.on('guildMemberAdd', async member => {
    if (!fs.existsSync(configPath)) return;
  
    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    const guildConfig = config[member.guild.id];
    if (!guildConfig) return;
  
    const channel = member.guild.channels.cache.get(guildConfig.channel);
    if (!channel) return;
  
    let message = guildConfig.message
      .replace(/\${member\.id}/g, member.id)
      .replace(/\${member\.tag}/g, member.user.tag)
      .replace(/\${member\.username}/g, member.user.username)
      .replace(/\${member\.discriminator}/g, member.user.discriminator)
      .replace(/\${member\.createdAt}/g, member.user.createdAt.toLocaleDateString())
      .replace(/\${member}/g, `<@${member.id}>`)
      .replace(/\${guild\.name}/g, member.guild.name)
      .replace(/\${guild\.memberCount}/g, member.guild.memberCount.toString());
  
    if (message.startsWith('--embed')) {
      message = message.replace('--embed', '').trim();
  
      const embed = new MessageEmbed()
      .setColor('#2F3136')
        .setDescription(message)
        .setFooter({ text: `Welcome to ${member.guild.name}` })
        .setTimestamp()
        .setAuthor({ name: member.user.tag, iconURL: member.user.displayAvatarURL() });
  
      channel.send({ embeds: [embed] });
    } else {
      channel.send({ content: message });
    }
  });
  

  client.once('ready', async () => {
      const queueChannelId = "1407411824306950367";
    const channel = client.channels.cache.get(queueChannelId);
    if (!channel) return console.error("Queue channel not found!");
      const embed = new MessageEmbed()
      .setTitle('🏆 1v1 League Queue')
      .setDescription('Prove yourself as the best player on the platform.\nMatchmake anonymously against another player to see who will reign victorious!')
      .setColor('#ff0000')
      .setImage(''); 
  
    const row = new MessageActionRow().addComponents(
      new MessageSelectMenu()
        .setCustomId('queue_select')
        .setPlaceholder('🎮 Select Matchmaking Gamemode')
        .addOptions([
          {
            label: '1v1 Vanwars Combat Pistols',
            value: 'vanwars_combat',
            description: 'Compete at Vanwars using Combat Pistols'
          },
          {
            label: '1v1 Vanwars AP Pistols',
            value: 'vanwars_ap',
            description: 'Compete at Vanwars using AP Pistols'
          },
          {
            label: '1v1 Ramps Combat Pistols',
            value: 'ramps_combat',
            description: 'Compete at Ramps using Combat Pistols'
          }
        ])
    );
      if (channel) {
      const messages = await channel.messages.fetch({ limit: 10 });
      const alreadySent = messages.find(msg => msg.author.id === client.user.id);
      if (!alreadySent) {
        await channel.send({ embeds: [embed], components: [row] });
        console.log("[Z]: Queue embed sent.");
      } else {
        console.log("[Z]: Queue embed already exists, skipping send.");
      }
    }
  });


  client.on('interactionCreate', async (interaction) => {
    if (interaction.isSelectMenu() && interaction.customId === 'queue_select') {
      const choice = interaction.values[0];
  
      if (!client.queue) client.queue = new Map();
      client.queue.set(interaction.user.id, {
        gamemode: choice,
        timestamp: Date.now()
      });
  
      const embed = new MessageEmbed()
        .setColor('#5865F2')
        .setTitle('Joined Matchmaking Queue')
        .setDescription(
          `**Gamemode:** \`${choice}\`\n\n` +
          `Your team has entered the matchmaking queue and will find an opponent soon.\n` +
          `You will receive a ✉️ Direct Message once your match begins.`
        )
        .setFooter({ text: 'Use the button below to leave the queue.' })
        .setTimestamp();
  
      const row = new MessageActionRow().addComponents(
        new MessageButton()
          .setCustomId('leave_queue')
          .setLabel('Leave Queue')
          .setStyle('DANGER')
      );
  
      await interaction.reply({
        embeds: [embed],
        components: [row],
        ephemeral: true
      });
    }
  
    if (interaction.isButton() && interaction.customId === 'leave_queue') {
      if (!client.queue || !client.queue.has(interaction.user.id)) {
        return interaction.reply({
          content: '⚠️ You are not currently in any queue.',
          ephemeral: true
        });
      }
  
      client.queue.delete(interaction.user.id);
  
      const embed = new MessageEmbed()
        .setColor('#ED4245')
        .setTitle('❌ Left Matchmaking Queue')
        .setDescription('You have been removed from the matchmaking queue.')
        .setTimestamp();
  
      await interaction.update({
        embeds: [embed],
        components: []
      });
    }
  });
  

client.once('ready', async () => {
  const channel = await client.channels.fetch('1407411827620446279'); // 2v2 channel ID
  if (!channel) return console.error('❌ Channel not found!');

  const messages = await channel.messages.fetch({ limit: 10 });
  const alreadySent = messages.some(msg => 
    msg.author.id === client.user.id &&
    msg.embeds.length > 0 &&
    msg.embeds[0].title === '⚔️ 2v2 League Queue'
  );

  if (alreadySent) {
    console.log('⚔️ 2v2 Queue embed already exists, not sending again.');
    return;
  }

  const embed = new MessageEmbed()
    .setColor('#2ECC71')
    .setTitle('⚔️ 2v2 League Queue')
    .setDescription(
      `Form your team and prove your strength!\n` +
      `Queue up for **2v2 matches** and get paired with opponents.\n\n` +
      `Select a gamemode below to enter the matchmaking queue.`
    )
    .setFooter({ text: 'You will receive a DM when your match begins.' });

  const row = new MessageActionRow().addComponents(
    new MessageSelectMenu()
      .setCustomId('queue_select_2v2')
      .setPlaceholder('🎮 Select 2v2 Matchmaking Gamemode')
      .addOptions([
        {
          label: '2v2 Ramps Combat Pistols',
          description: 'Compete at Ramps using Combat Pistols',
          value: '2v2_ramps_combat'
        },
        {
          label: '2v2 Ramps AP Pistols',
          description: 'Compete at Ramps using AP Pistols',
          value: '2v2_ramps_ap'
        }
      ])
  );


  client.on('interactionCreate', async (interaction) => {
    if (interaction.isSelectMenu() && interaction.customId === 'queue_select_3v3') {
      const choice = interaction.values[0];
  
      if (!client.teams) client.teams = new Map();
      client.teams.set(interaction.user.id, {
        gamemode: choice,
        members: [interaction.user.id]
      });
  
      const embed = new MessageEmbed()
        .setTitle('👥 Teammate Selection')
        .setDescription(`You have selected **1/3 players** required for this gamemode.\n\nYour Team:\n<@${interaction.user.id}>`)
        .setColor('#e74c3c');
  
      const row = new MessageActionRow().addComponents(
        new MessageButton()
          .setCustomId('add_teammate')
          .setLabel('Add Player')
          .setStyle('PRIMARY')
          .setEmoji('👤'),
        new MessageButton()
          .setCustomId('remove_teammate')
          .setLabel('Remove Player')
          .setStyle('DANGER')
          .setEmoji('💥')
      );
  
      await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
    }
  
    if (interaction.isButton() && interaction.customId === 'add_teammate') {
      const modal = new Modal()
        .setCustomId('add_teammate_modal')
        .setTitle('Add a Teammate');
  
      const input = new TextInputComponent()
        .setCustomId('teammate_id')
        .setLabel('Enter Discord User ID')
        .setStyle('SHORT')
        .setPlaceholder('Example: 123456789012345678')
        .setRequired(true);
  
      const row = new MessageActionRow().addComponents(input);
      modal.addComponents(row);
  
      await interaction.showModal(modal);
    }
  
    if (interaction.isModalSubmit() && interaction.customId === 'add_teammate_modal') {
      const teammateId = interaction.fields.getTextInputValue('teammate_id');
      const team = client.teams.get(interaction.user.id);
  
      if (!team) {
        return interaction.reply({ content: '⚠️ No active team found.', ephemeral: true });
      }
  
      const user = await client.users.fetch(teammateId).catch(() => null);
      if (!user) {
        return interaction.reply({ content: '❌ Invalid user ID.', ephemeral: true });
      }
      if (team.members.includes(teammateId)) {
        return interaction.reply({ content: '⚠️ That player is already in your team.', ephemeral: true });
      }
      if (team.members.length >= 3) {
        return interaction.reply({ content: '⚠️ Your team is already full.', ephemeral: true });
      }
  
      team.members.push(teammateId);
        const embed = new MessageEmbed()
        .setTitle('👥 Teammate Selection')
        .setDescription(`You have selected **${team.members.length}/3 players** required for this gamemode.\n\nYour Team:\n${team.members.map(id => `<@${id}>`).join('\n')}`)
        .setColor('#2ecc71');
  
      if (team.members.length === 3) {
        client.queue = client.queue || [];
        client.queue.push(team);
  
        return interaction.reply({
          content: `✅ Team completed!\n:loading: **Joined Matchmaking Queue**\nGamemode: \`${team.gamemode}\`\n\nYour team will find an opponent soon. You’ll receive a ✉️ Direct Message once your match begins.`,
          ephemeral: true
        });
      }
  
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }
  });

  await channel.send({ embeds: [embed], components: [row] });
  console.log('✅ 2v2 Queue embed sent.');
});

client.once('ready', async () => {
  const channel = await client.channels.fetch('1407411831273951336'); // 3v3 channel ID
  if (!channel) return console.error('❌ Channel not found!');
  const messages = await channel.messages.fetch({ limit: 10 });
  const alreadySent = messages.some(msg => 
    msg.author.id === client.user.id &&
    msg.embeds.length > 0 &&
    msg.embeds[0].title === '⚔️ 3v3 League Queue'
  );

  if (alreadySent) {
    console.log('⚔️ 3v3 Queue embed already exists, not sending again.');
    return;
  }
  const embed = new MessageEmbed()
    .setColor('#3498DB')
    .setTitle('⚔️ 3v3 League Queue')
    .setDescription(
      `Gather your squad of 3 and show your skills!\n` +
      `Queue up for **3v3 matches** and get paired with opponents.\n\n` +
      `Select a gamemode below to enter the matchmaking queue.`
    )
    .setFooter({ text: 'You will receive a DM when your match begins.' });
  const row = new MessageActionRow().addComponents(
    new MessageSelectMenu()
      .setCustomId('queue_select_3v3')
      .setPlaceholder('🎮 Select 3v3 Matchmaking Gamemode')
      .addOptions([
        {
          label: '3v3 Stables Combat Pistols',
          description: 'Fight at Stables with Combat Pistols',
          value: '3v3_stables_combat'
        },
        {
          label: '3v3 Stables AP Pistols',
          description: 'Fight at Stables with AP Pistols',
          value: '3v3_stables_ap'
        },
        {
          label: '3v3 Soccer Arena Combat Pistols',
          description: 'Play at Soccer Arena with Combat Pistols',
          value: '3v3_soccer_combat'
        },
        {
          label: '3v3 Soccer Arena AP Pistols',
          description: 'Play at Soccer Arena with AP Pistols',
          value: '3v3_soccer_ap'
        }
      ])
  );

  await channel.send({ embeds: [embed], components: [row] });
  console.log('✅ 3v3 Queue embed sent.');
});






client.queue3v3 = new Map(); 
client.matchQueue3v3 = [];   
/*

const fakeTeam = {
  leader: "123456789012345678", // fake discord ID
  gamemode: "3v3_stables_combat",
  team: [
    "155149108183695360", // leader
    "155149108183695360", // teammate 1
    "1407451194523123853", // teammate 2
  ],
  timestamp: Date.now(),
};

client.matchQueue3v3.push(fakeTeam);
console.log("[3v3] Fake team added:", fakeTeam.team);
*/

client.on("interactionCreate", async (interaction) => {
  if (interaction.isSelectMenu() && interaction.customId === "queue_select_3v3") {
    const choice = interaction.values[0];

    if (!client.queue3v3.has(interaction.user.id)) {
      client.queue3v3.set(interaction.user.id, {
        leader: interaction.user.id,
        gamemode: choice,
        team: [interaction.user.id],
        timestamp: Date.now(),
      });
    }

    const team = client.queue3v3.get(interaction.user.id);

    const embed = new MessageEmbed()
      .setColor("#e67e22")
      .setTitle("👥 3v3 Team Setup")
      .setDescription(
        `Gamemode: \`${choice}\`\n\n` +
          `You are the **team leader**.\n` +
          `Add 2 teammates by entering their Discord IDs.\n\n` +
          `**Current Team:**\n${team.team.map((id) => `<@${id}>`).join("\n")}`
      )
      .setFooter({
        text: "When 3 players are added, the queue will begin automatically.",
      });

    const row = new MessageActionRow().addComponents(
      new MessageButton()
        .setCustomId("team_add")
        .setLabel("➕ Add Player")
        .setStyle("PRIMARY"),
      new MessageButton()
        .setCustomId("team_remove")
        .setLabel("➖ Remove Player")
        .setStyle("SECONDARY"),
      new MessageButton()
        .setCustomId("team_leave")
        .setLabel("🚪 Leave Queue")
        .setStyle("DANGER")
    );

    return interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
  }

  if (interaction.isButton() && interaction.customId === "team_add") {
    const modal = new Modal()
      .setCustomId("add_player_modal")
      .setTitle("Add Teammate")
      .addComponents(
        new MessageActionRow().addComponents(
          new TextInputComponent()
            .setCustomId("player_id")
            .setLabel("Enter Teammate Discord ID")
            .setStyle("SHORT")
            .setRequired(true)
        )
      );

    return interaction.showModal(modal);
  }

  if (interaction.isModalSubmit() && interaction.customId === "add_player_modal") {
    const teammateId = interaction.fields.getTextInputValue("player_id");
    const team = client.queue3v3.get(interaction.user.id);

    if (!team) {
      return interaction.reply({
        content: "❌ You are not leading a team.",
        ephemeral: true,
      });
    }

    if (team.team.includes(teammateId)) {
      return interaction.reply({
        content: "⚠️ That player is already on your team.",
        ephemeral: true,
      });
    }

    if (team.team.length >= 3) {
      return interaction.reply({
        content: "⚠️ Your team already has 3 players.",
        ephemeral: true,
      });
    }

    team.team.push(teammateId);
    client.queue3v3.set(interaction.user.id, team); 

    const embed = new MessageEmbed()
      .setColor("#e67e22")
      .setTitle("👥 3v3 Team Setup")
      .setDescription(
        `Gamemode: \`${team.gamemode}\`\n\n` +
          `**Current Team:**\n${team.team.map((id) => `<@${id}>`).join("\n")}`
      );

    await interaction.reply({
      content: `✅ Added <@${teammateId}> to your team.`,
      embeds: [embed],
      ephemeral: true,
    });

    if (team.team.length === 3) {
      client.matchQueue3v3.push(team);
      console.log(`[3v3] Team full: ${team.team.join(", ")}`);

      if (client.matchQueue3v3.length >= 2) {
        const [team1, team2] = client.matchQueue3v3.splice(0, 2);

        const guild = interaction.guild;
        const channel = await guild.channels.create(`3v3-match-${Date.now()}`, {
          type: "GUILD_TEXT",
          permissionOverwrites: [
            { id: guild.id, deny: ["VIEW_CHANNEL"] },
            ...team1.team
              .filter(id => guild.members.cache.has(id)) 
              .map(id => ({
                id,
                allow: ["VIEW_CHANNEL", "SEND_MESSAGES"],
              })),
            ...team2.team
              .filter(id => guild.members.cache.has(id)) 
              .map(id => ({
                id,
                allow: ["VIEW_CHANNEL", "SEND_MESSAGES"],
              })),
          ],
        });
        
        const matchEmbed = new MessageEmbed()
          .setColor("#e74c3c")
          .setTitle("📋 Match Controls")
          .setDescription(
            `Team leaders can use the panel below to control the match.\n` +
              `Make sure to comply with our rules!\n\n` +
              `**Team 1:**\n${team1.team.map((id) => `<@${id}>`).join("\n")}\n\n` +
              `**Team 2:**\n${team2.team.map((id) => `<@${id}>`).join("\n")}`
          );

        const controlsRow = new MessageActionRow().addComponents(
          new MessageButton()
            .setCustomId("request_staff")
            .setLabel("🔔 Request Staff")
            .setStyle("PRIMARY"),
          new MessageButton()
            .setCustomId("assign_winner")
            .setLabel("⚡ Assign Winner")
            .setStyle("DANGER")
        );

        await channel.send({ embeds: [matchEmbed], components: [controlsRow] });
        console.log(`[3v3] Match started in #${channel.name}`);
      }
    }
  }
});


const ranks = [
  { name: "Noob", min: 0, max: 399, roleId: "1407411676734689401" },
  { name: "Rookie", min: 400, max: 1499, roleId: "1407411675363147926" },
  { name: "Pro", min: 1500, max: 1799, roleId: "1407411674201198673" },
  { name: "Legend", min: 1800, max: 2499, roleId: "1407411671122706594" },
  { name: "God", min: 2500, max: 3999, roleId: "1407411669793116331" },
  { name: "Demon", min: 4000, max: 4999, roleId: "1409568754773393548" },
  { name: "Undisputed", min: 5000, max: Infinity, roleId: "1409568951200911372" }
];

async function updateRankRoles(member, points) {
  const guild = member.guild;
  const newRank = ranks.find(r => points >= r.min && points <= r.max);
  if (!newRank) return;
  const roleIds = ranks.map(r => r.roleId);
  await member.roles.remove(roleIds).catch(() => null);
  const role = guild.roles.cache.get(newRank.roleId);
  if (role) await member.roles.add(role).catch(() => null);

  return newRank;
}

client.on("interactionCreate", async (interaction) => {
  if (interaction.isButton() && interaction.customId === "assign_winner") {
    const row = new MessageActionRow().addComponents(
      new MessageSelectMenu()
        .setCustomId("select_winner_team")
        .setPlaceholder("Select winning team")
        .addOptions([
          { label: "Team 1", value: "1" },
          { label: "Team 2", value: "2" }
        ])
    );

    return interaction.reply({
      content: "Choose the winning team:",
      components: [row],
      ephemeral: true
    });
  }
  if (interaction.isSelectMenu() && interaction.customId === "select_winner_team") {
    const matchChannel = interaction.channel;
    const messages = await matchChannel.messages.fetch({ limit: 10 });

    const matchMsg = messages.find(
      (m) => m.embeds.length && m.embeds[0].title === "📋 Match Controls"
    );
    if (!matchMsg) {
      return interaction.reply({
        content: "⚠️ Could not find match data.",
        ephemeral: true
      });
    }

    const embed = matchMsg.embeds[0];
    const lines = embed.description.split("\n");

const team1Start = lines.indexOf("**Team 1:**");
const team2Start = lines.indexOf("**Team 2:**");
const team1Ids = lines
  .slice(team1Start + 1, team2Start)
  .flatMap(line => [...line.matchAll(/<@!?(\d+)>/g)].map(m => m[1]));
const team2Ids = lines
  .slice(team2Start + 1)
  .flatMap(line => [...line.matchAll(/<@!?(\d+)>/g)].map(m => m[1]));
    const winnerTeam = interaction.values[0] === "1" ? team1Ids : team2Ids;
    const loserTeam = interaction.values[0] === "1" ? team2Ids : team1Ids;
    const guild = interaction.guild;
    const resultEmbed = new MessageEmbed()
      .setColor("#2ecc71")
      .setTitle("🏆 Match Result");
    let winnerText = "";
    for (const id of winnerTeam) {
      const member = guild.members.cache.get(id);
      if (!member) continue;

      const newPts = addPoints(id, 15); 
      const rank = await updateRankRoles(member, newPts);

      winnerText += `${member} (+15 pts)\n`;
    }
    let loserText = "";
    for (const id of loserTeam) {
      const member = guild.members.cache.get(id);
      if (!member) continue;

      const newPts = addPoints(id, -10); 
      const rank = await updateRankRoles(member, newPts);

      loserText += `${member} (-10 pts)\n`;
    }
    resultEmbed.setDescription(`**Winner:**\n${winnerText}\n**Loser:**\n${loserText}`);
    const resultsChannel = guild.channels.cache.get(config.winloss_announce_channel_id);
    if (resultsChannel && resultsChannel.isText()) {
      await resultsChannel.send({ embeds: [resultEmbed] });
    }
    await interaction.reply({
      content: "✅ Match result recorded! This channel will now be deleted.",
      ephemeral: true
    });

    setTimeout(async () => {
      try {
        await matchChannel.delete();
      } catch (err) {
      }
    }, 5000);
  }
});
function getUserData(userId) {
  const data = loadPoints();
  if (!data[userId] || typeof data[userId] !== "object") {
    data[userId] = { points: 0, wins: 0, losses: 0, dailyChange: 0 };
    savePoints(data);
  }
  return data[userId];
}

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isModalSubmit()) return;

  if (interaction.customId === "nicknameModal") {
    const nickname = interaction.fields.getTextInputValue("nicknameInput");
    const data = getUserData(interaction.user.id);
    const points = data.points || 0;

    const finalName = `[${points}] ${nickname}`;

    try {
      await interaction.member.setNickname(finalName);
      await interaction.reply({
        content: `✅ Your nickname has been set to **${finalName}**`,
        ephemeral: true
      });
    } catch (err) {
      console.error("Nickname error:", err);
      await interaction.reply({
        content: "❌ I couldn’t change your nickname. Do I have permission?",
        ephemeral: true
      });
    }
  }
});



client.login(config.token);
