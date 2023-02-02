const { ActionRowBuilder, Events, ModalBuilder, TextInputBuilder, TextInputStyle, EmbedBuilder } = require('discord.js');
const rolesFile = require('../../data/roles.json');
const rules = require('../../data/rules.json');
const configFile = require('../../data/config.json');
const fs = require('fs');
let selection;

const embedBuilder = async (opt) => {
  console.log("embedBuilder opt", opt);

  const embed = new EmbedBuilder()
  switch(opt) {
    case 'main':
      embed.setTitle('Admin Menu')
      embed.setDescription('Welcome to the Noobs Rank Bot Admin Panel!  From the selection below, please choose an option.\n\nQuestions, comments or concerns, please send them to Zaff#6073.')
      embed.setThumbnail('https://cdn.discordapp.com/attachments/583788262771130372/751898867624312932/Animated_NP_Logo2.gif')
    break;

    case 'enter_config':
      embed.setTitle('Noobs Rank configuration menu')
      embed.setDescription('In this menu, you can View or Update various configuration settings.\n\n⚠️Caution⚠️:\nOnly edit the values here if you know what you are doing as this will break functionality if incorrectly set.')
    break;

    case 'enter_roles':
      embed.setTitle('Discord Roles configuration menu')
      embed.setDescription('In this menu, you can Add, Update, or Remove available self-assigned roles.\n\n🆕: Add a new role.  Ensure that the bot has the proper permissions otherwise this will cause an error!\n\n⚙️: To update the selected role\n\n❌: To remove a role')
    break;

    default:
      embed.setTitle('No Embed Found')
      embed.setDescription(`Embed opt ${opt} is not defined, please send this message to Zaff.`)
      embed.setColor('Red')
  }

  return embed;
}

const componentBuilder = async (opt) => {
  console.log("componentBuilder opt", opt);

  switch(opt) {
    case 'main':
      return {
        type: 1,
        components: [{
          type: 3,
          custom_id: 'main',
          options: [
            { label: 'Roles',
              value: 'enter_roles',
              description: 'Add, Update, or Remove user assigned Discord roles', 
              emoji: {
                name: "tob",
                id: "584345639450705932"
              }
            },
            { label: 'Config',
              value: 'enter_config',
              description: 'View or Update bot configuration settings',
              emoji: {
                name: "⚙️",
              }
            },
          ],
          placeholder: "Please choose an option"   
        }]
      }

    case 'enter_config':
      let cfgArr = [];

      Object.entries(configFile).forEach(([k, v]) => {
        cfgArr.push({
          label: `${k}`,
          value: `${k},${v}`,
          description: `${v}`
        });
      });
      // cfgArr.push({ label: 'Return', value: 'main', description: 'Return to the main menu'});
      return {
        type: 1,
        components: [{
          type: 3,
          custom_id: 'edit_config',
          options: cfgArr
        }]
      }

    case 'enter_roles':
      let rolesArr = [];
      // for (let i in discordRules) {
      //   options.push({
      //     label: `Discord Rule #${(discordRules[i].messageID === "none" ? discordRules[i].ruleNum + " *NEW*" : discordRules[i].ruleNum)}`,
      //     value: `discord_${discordRules[i].ruleNum}`,
      //     description: discordRules[i].ruleText.length < 50 ? discordRules[i].ruleText : discordRules[i].ruleText.slice(0,50)+"..."
      //   });
      // }
      for (let i in rolesFile) {
        rolesArr.push({
          label: `${rolesFile[i]}`
        })
      }
      return {
        // Stuff
      }

    default:
      return {
        type: 1,
        components: [{
          type: 3,
          custom_id: 'main',
          options: [
            { label: 'Return to Main Menu',
              value: 'main',
              description: `Component opt ${opt} is not defined`,
            }
          ],
          placeholder: "Error"
        }]
      }
      
  }
 
}

const modalBuilder = async (opt) => {
  const modal = new ModalBuilder()
  
  
  
  
  switch(opt[0]) {
    case 'edit_config':
      const configTextInput = new TextInputBuilder()
      const configTextInput2 = new TextInputBuilder()
      const configActionRow = new ActionRowBuilder()
      const configActionRow2 = new ActionRowBuilder()
      let split = opt[1].split(',')
      modal.setCustomId(`edit_config,${split[0]}`)
      modal.setTitle(`Editing Menu`)
      configTextInput.setCustomId('channelIdInputBox')
      configTextInput.setLabel(`${split[0]}`)
      configTextInput.setValue(`${split[1]}`)
      configTextInput.setStyle(TextInputStyle.Short)

      configTextInput2.setCustomId('secondInputBox')
      configTextInput2.setLabel(`${split[0]}`)
      configTextInput2.setValue(`${split[1]}`)
      configTextInput2.setStyle(TextInputStyle.Short)

      configActionRow.addComponents(configTextInput)
      // configActionRow2.addComponents(configTextInput2)
      
      // modal.addComponents(configActionRow, configActionRow2)
      modal.addComponents(configActionRow)

      return modal;

    case 'edit_roles':
      const roleNameTextInput = new TextInputBuilder()
      const roleDescTextInput = new TextInputBuilder()
      const roleActionRow = new ActionRowBuilder()

      roleNameTextInput.setCustomId('roleNameInputBox')
      roleNameTextInput.setLabel('Role Name goes here')
      roleNameTextInput.setValue('Role Name in text value')
      roleNameTextInput.setStyle(TextInputStyle.Short)
    break;
  }
  console.log("modalBuilder opt", opt);


  

}


const handleModalSubmit = async (interaction) => {
  console.log("handleModalInteraction interaction", interaction);
  console.log(`interaction.fields[0]`, interaction.fields.fields)
  
  let opt = interaction.customId.split(',');
  let filePath;

  switch(opt[0]) {
    case 'edit_config':
      const channelId = interaction.fields.getTextInputValue('channelIdInputBox');
      filePath = './data/config.json';
      fileName = configFile;
      config[opt[1]] = channelId;

      // console.log("channelId", channelId);
      // console.log("opt[1]", opt[1]);
      break;
      
      case 'edit_roles':
        const roleName = interaction.fields.getTextInputValue('roleNameInputBox');
        const roleDesc = interaction.fields.getTextInputValue('roleDescInputBox');
        filePath = './data/roles.json';
        fileName = rolesFile;


        break;
      }

      fs.writeFile(filePath, JSON.stringify(fileName), (err) => {
        if (err) console.log(err);
      });
}

module.exports = {
  embedBuilder,
  componentBuilder,
  modalBuilder,
  handleModalSubmit
}