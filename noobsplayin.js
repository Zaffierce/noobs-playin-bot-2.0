const { Client, Collection, Intents } = require('discord.js');

const bot = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });
const config = require('./config.json');
require('dotenv').config();
const { TOKEN } = process.env;
const { start, deleteAllCommands } = require('./utils/commandHandler.js');

bot.commands = new Collection()

const fs = require('fs');
const cmdFiles = fs.readdirSync('./commands').filter(file => file.endsWith('js'));
for (const file of cmdFiles) {
	const command = require(`./commands/${file}`);
	bot.commands.set(command.data.name, command);
};

bot.once('ready', async () => {
  // await deleteAllCommands();
  await start(bot.commands);
  console.log('\n')
  for ([k, v] of bot.commands.entries()) {
    console.log(`Loading command ${v.data.name}... `)
  }
  console.log('\n')
  console.log('Noobs Rank Bot 2.0, Online!');
});

bot.on('interactionCreate', async (interaction) => {
  // console.log(interaction);
  const command = bot.commands.get(interaction.commandName);
  if (!command) return;
  
  try {
    await command.execute(interaction, bot);
  } catch (e) {
    console.error(e);
    await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
  }
});

bot.login(TOKEN);