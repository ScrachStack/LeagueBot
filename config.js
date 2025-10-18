const config = {
    token: "TOKEN_HERE",
    guildIds: ['1407411383452045403', '1129386849098551360', '1391116105472540802', '1119734000974565439', '1307606937738809344', '1193299915825229845'], // You can put multiple IDs here
 
  owner_id: "",
  league_admin_role_id: "1407411667964399677",
  winloss_announce_channel_id: "1407411817516499055",

  category_1v1_id: "1407411690068377672",
  category_2v2_id: "1407411691888840827",
  category_3v3_id: "1407411694065680394",
  ranks: [
    {
      name: "Noob",
      min: 0,
      max: 399,
      win: 60,
      loss: -70,
      roleId: "1407411676734689401",
    },
    {
      name: "Rookie",
      min: 400,
      max: 899,
      win: 55,
      loss: -65,
      roleId: "1407411675363147926",
    },
    {
      name: "Pro",
      min: 900,
      max: 1499,
      win: 50,
      loss: -60,
      roleId: "1407411674201198673",
    },
    {
      name: "Legend",
      min: 1500,
      max: 1799,
      win: 35,
      loss: -45,
      roleId: "1407411671122706594",
    },
    {
      name: "God",
      min: 1800,
      max: 2499,
      win: 30,
      loss: -40,
      roleId: "1407411669793116331",
    },
    {
      name: "Demon",
      min: 2500,
      max: 3999,
      win: 20,
      loss: -30,
      roleId: "1409568754773393548",
    },
    {
      name: "Undisputed",
      min: 4000,
      max: Infinity,
      win: 10,
      loss: -25,
      roleId: "1409568951200911372",
    },
  ]
};
  
  module.exports = config;
  
  
