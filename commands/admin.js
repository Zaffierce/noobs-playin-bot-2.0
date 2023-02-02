const { SlashCommandBuilder } = require("@discordjs/builders");
const { ActionRowBuilder, Events, TextInputBuilder, TextInputStyle } = require('discord.js');
const { embedBuilder, componentBuilder, modalBuilder, handleModalSubmit } = require('../utils/admin/adminInteractionHandler.js');

const execute = async (interaction, bot) => {
  console.log(interaction);
  if (interaction.isChatInputCommand()) {
    console.log("isChatInputCommand()")
    return interaction.reply({
      embeds: [ await embedBuilder('main') ],
      components: [ await componentBuilder('main') ],
      ephemeral: true
    });
  }

  if (interaction.isStringSelectMenu()) {
    console.log("isStringSelectMenu()");
    console.log(`interaction.customId is ${interaction.customId}, interaction.values is ${interaction.values}`);
    console.log(interaction);

    switch(`${interaction.customId}`) {
      case 'edit_config':
        return interaction.showModal( await modalBuilder([`${interaction.customId}`,`${interaction.values}`]))
        //Send modal

      default:
        return interaction.update({
          embeds: [ await embedBuilder(`${interaction.values}`) ],
          components: [ await componentBuilder(`${interaction.values}`) ],
          ephemeral: true
        });
    }

    // console.log(`interaction.message.components[0]`, interaction.message.components[0].components[0])
  }

  if (interaction.isModalSubmit()) {
    
    console.log("isModalSubmit()");
    await handleModalSubmit(interaction);

    return interaction.update({
      embeds: [ await embedBuilder('main') ],
      components: [ await componentBuilder('main') ],
      ephemeral: true
    });

  }
  
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('admin')
    .setDescription('Admin panel for the Noobs Rank Bot'),
    execute
};