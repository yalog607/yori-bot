const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Replies with bot\'s latency!')
    ,

    run: async ({interaction, client}) => {
        if (!interaction.inGuild()) {
            interaction.reply({
                content: 'This command can only be executed inside the server.',
                ephemeral: true
            });
            return;
        }
        let msg = await interaction.channel.send({
            embeds: [
              new EmbedBuilder().setDescription("🎾 | Ping...").setColor("#6F8FAF"),
            ],
          });
    
          let zap = "⚡";
          let green = "🟩";
          let red = "🟥";
          let yellow = "🟨";
    
          var botState = zap;
          var apiState = zap;
    
          let apiPing = client.ws.ping;
          let botPing = Math.floor(msg.createdAt - interaction.createdAt);
    
          if (apiPing >= 40 && apiPing < 200) {
            apiState = green;
          } else if (apiPing >= 200 && apiPing < 400) {
            apiState = yellow;
          } else if (apiPing >= 400) {
            apiState = red;
          }
    
          if (botPing >= 40 && botPing < 200) {
            botState = green;
          } else if (botPing >= 200 && botPing < 400) {
            botState = yellow;
          } else if (botPing >= 400) {
            botState = red;
          }
          msg.delete();
          interaction.reply({
            embeds: [
              new EmbedBuilder()
                .setTitle("🏓 | Pong!")
                .addFields(
                  {
                    name: "API Latency",
                    value: `\`\`\`yml\n${apiState} | ${apiPing}ms\`\`\``,
                    inline: true,
                  },
                  {
                    name: "Bot Latency",
                    value: `\`\`\`yml\n${botState} | ${botPing}ms\`\`\``,
                    inline: true,
                  }
                )
                .setColor(
                  Math.floor(Math.random() * 0xffffff)
                    .toString(16)
                    .padStart(6, "0")
                )
                .setFooter({
                  text: `Request by ${interaction.user.username}`,
                  iconURL: `https://cdn.discordapp.com/avatars/${interaction.user.id}/${interaction.user.avatar}.webp?size=4096`,
                }),
            ],
          });
    }
}