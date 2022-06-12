const { SlashCommandBuilder } = require("@discordjs/builders");

const execute = async (interaction, bot) => {
  await interaction.reply({ content: "Test" });
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('admin')
    .setDescription('Admin panel for the Noobs Rank Bot'),
    execute
};