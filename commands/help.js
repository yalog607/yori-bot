const { SlashCommandBuilder, EmbedBuilder  } = require('discord.js');
const config = require('../config');
function random(colors) {
    return colors[Math.floor(Math.random() * colors.length)];
};
  
module.exports = {
    data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('List of bot commands available.')
    ,

    run: ({interaction, client}) => {
        if (!interaction.inGuild()) {
            interaction.reply({
                content: 'This command can only be executed inside the server.',
                ephemeral: true
            });
            return;
        }
        const exampleEmbed = new EmbedBuilder()
        .setColor(random(['#008000', '#E50000']))
        .setTitle('🍾 List of bot commands available')
        .setDescription('Prefix: \'#\'')
        .setAuthor({ name: 'Yori', iconURL: `https://cdn.discordapp.com/avatars/1144860424035127356/48a56e5f1c436bc188294dd79ba6753f.png?size=4096` })
        .addFields(config.help)
        .setTimestamp()
        .setFooter({
            text: `| Requested by ${interaction.user.username}`,
            iconURL: `https://cdn.discordapp.com/avatars/${interaction.user.id}/${interaction.user.avatar}.webp?size=4096`,
          });
    interaction.reply({ embeds: [exampleEmbed] });
    }
}