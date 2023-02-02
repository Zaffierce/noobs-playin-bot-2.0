const { EmbedBuilder } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v10');
const fs = require('fs');
const superagent = require('superagent');
const config = require('../data/config.json');
require('dotenv').config();
const { TOKEN, CLIENTID, GUILDID, MODERATOR_ROLE_ID } = process.env;
const rest = new REST({ version: '10'}).setToken(TOKEN);

const start = async (bot) => {
  const cmdsArr = [];
  const guildCmdsArr = [];
  console.log('Checking for new commands...');
  const guildCmds = await getCommands();
  for (cmd in guildCmds) guildCmdsArr.push(guildCmds[cmd].name);
  for (const [k, v] of bot.entries()) {
    if (v.data.type != 'text') cmdsArr.push(v.data.name);
  }
  if (guildCmds.length == cmdsArr.length) {
    console.log('Check complete!')
    return true;
  } else {
    console.log(`!!MISMATCH!!  / commands found to be registered: ${guildCmdsArr.length} - / commands found in files: ${cmdsArr.length}`);
    const bigger = guildCmdsArr.length > cmdsArr.length ? guildCmdsArr : cmdsArr;
    const smaller = guildCmdsArr.length < cmdsArr.length ? guildCmdsArr : cmdsArr;
    const diff = bigger.filter(x => !smaller.includes(x));
    console.log('New / commands have been found', diff);
    for (cmd in diff) { 
      let res = await deploySingleCommand(diff[cmd]);
      // if (res.default_permission === false) await setAsAdminCommand(res.id, res.name);
    } 
    console.log('Check complete!')
    return true;
  }
}

const getCommands = async () => {
  return await rest.get(Routes.applicationGuildCommands(CLIENTID, GUILDID))
  .then((res) => {
    if (res.length === 0) console.log('No commands were found.');
    return res;
  })
  .catch(console.error);
}

const deploySingleCommand = async (cmd) => {
  const commandArr = [];
  const command = require(`../commands/${cmd}.js`);
  commandArr.push(command.data.toJSON());
  return await rest.post(Routes.applicationGuildCommands(CLIENTID, GUILDID), { body: command.data.toJSON() })
    .then((res) => { 
      console.log(`/${res.name} has been registered with ID - ${res.id}.`);
      return res;
    })
    .catch(console.error);
}

const deleteSingleCommand = async (commandID) => {
  try {
    return await rest.delete(Routes.applicationGuildCommand(CLIENTID, GUILDID, commandID))
    .then(() => {
      return { status: 200, msg: "Successfully deleted" }
    })
  } catch (e) {
    return { status: e.status, msg: "ERROR" }
  }
}

const deleteAllCommands = async () => {
  const commands = await getCommands();
  for (i in commands) {
    console.log(`Deleting ${commands[i].id} - ${commands[i].name}`);
    await deleteSingleCommand(commands[i].id);
  }
  console.log("All commands have been deleted, shutting down Bot.");
  process.kill(process.pid);
}

const checkRW = async (username, bot) => {
  let embed;
  superagent.get(`https://runewatch.com/api/v2/rsn/${username}`).then(res => {
    Object.keys(res.body).forEach(key => {
      embed = new EmbedBuilder()
        .setColor("Red")
        .setTitle(`RuneWatch results ${res.body[key].rsn}`)
        .setDescription(res.body[key].type)
        .addFields(
          { name: "Details", value: `• Date of abuse: <t:${res.body[key].date_of_abuse}>\n• Link: ${res.body[key].url}` }
        )
      bot.channels.cache.get(config.runewatch_channel_ID).send({ embeds: [embed] });
    });
  }).catch((e) => {
    if (e.status == "404") {
      embed = new EmbedBuilder()
        .setColor("Green")
        .setTitle(`RuneWatch results for ${username}`)
        .setDescription("No results found!")
      bot.channels.cache.get(config.runewatch_channel_ID).send({ embeds: [embed] });
    } else {
      bot.channels.cache.get(config.runewatch_channel_ID).send({ content: `An unhandled error has occured while checking RuneWatch for ${username}`});
      console.log(e);
    }
  });
}

// const setAsAdminCommand = async (commandID, commandName) => {
//   const json = {
//     "permissions": [{
//       "id": MODERATOR_ROLE_ID,
//       "type": 1,
//       "permission": true
//     }]
//   }

//   try {
//     return await rest.put(Routes.applicationCommandPermissions(CLIENTID, GUILDID, commandID), { body: json})
//     .then((res) => {
//       if (commandName) console.log(`/${commandName} has been flagged as an Admin only command.`);
//       else console.log(`/${commandID} has been updated to be an Admin only command.`);
//       return { status: 200, msg: "Successfully updated" };
//     })
//   } catch (e) {
//     return { status: e.status, msg: "ERROR" }
//   }
// }

module.exports = {
  start,
  deleteAllCommands,
  checkRW
}