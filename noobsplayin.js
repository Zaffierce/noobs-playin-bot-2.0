const { Client, Collection, Events, GatewayIntentBits, IntentsBitField, PermissionsBitField, InteractionResponseType, EmbedBuilder } = require('discord.js');

const bot = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMembers, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildWebhooks] })
const config = require('./data/config.json');
require('dotenv').config();
const { TOKEN } = process.env;
const { start, deleteAllCommands, checkRW,  } = require('./utils/commandHandler.js');

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
  // console.log("interactionCreate", interaction);
  const commandName = interaction.commandName ? interaction.commandName 
  : interaction.message.interaction ? interaction.message.interaction.commandName
  : interaction.customId ? interaction.customId
  : null;

  const command = bot.commands.get(commandName);
  
  if (!command) return;

  try {
    await command.execute(interaction, bot);
  } catch (e) {
    console.error(e);
    await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
  }
});

// bot.ws.on('INTERACTION_CREATE', async (interaction) => {
//   console.log("ws INTERACTION_CREATE", interaction);
// });

// bot.on('raw', async (interaction) => {
//   console.log("raw", interaction);
// })

bot.on('messageCreate', async (interaction) => {
  if (interaction.author.bot) return;
  if (interaction.channelId !== config.nickname_channel_ID) return;
  if (!interaction.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageNicknames)) return interaction.reply("An error has occured while setting your nickname, I am missing permission `Manage Nicknames`."); 

  let response = `Your nickname has been set to ${interaction.content}.`;
  let previousName = interaction.member.nickname ? interaction.member.nickname : "-";
  let avatar = interaction.member.user.avatar ? `https://cdn.discordapp.com/avatars/${interaction.member.user.id}/${interaction.member.user.avatar}` : `https://cdn.discordapp.com/embed/avatars/1.png`;
  let err;

  interaction.member.setNickname(interaction.content).catch((e) => {
    err = true;
    if (e.code == "50013") { 
      //Missing permissions
      return response = "An error has occured while setting your nickname, most likely due to your role being above my role. Please use `/nick` instead.";
    } else if (e.code == "50035") {
      //Input > 32 characters
      return response = "An error has occured while setting your nickname, names must be 32 characters or shorter.";
    } else {
      return response = "An unhandled exception has occured while setting your nickname.";
    }
  }).finally(() => {
    if (!err) {
      const embed = new EmbedBuilder()
      .setColor("#76FF33")
      .setTitle("Nickname Update:")
      .setAuthor({ name: `${interaction.member.user.username}#${interaction.member.user.discriminator}`, iconURL: avatar })
      .addFields(
        { name: "OLD", value: previousName, inline: true },
        { name: "NEW", value: interaction.content, inline: true }
      )
      .setTimestamp()
      .setFooter({ text: "Updated on" })
      bot.channels.cache.get(config.nickname_historical_channel_ID).send({ embeds: [embed] });

      checkRW(interaction.content, bot);
    }
    return interaction.reply({
      content: response
    });
  });



  
  

  // console.log("previousName", previousName);
  //Send Nickname Update
  //Check RW


});

// bot.on('guildMemberAdd', async (interaction) => {
//   // Member join Discord
//   // Unused for now, but may have a purpose in the future.
// });

bot.login(TOKEN);