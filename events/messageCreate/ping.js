require('dotenv/config');
const Cooldown = require('../../schemas/Cooldown');
const { EmbedBuilder } = require('discord.js');

module.exports = async (message, client) => {
    if (message.author.bot) return;
    if (!message.content.startsWith(process.env.PREFIX)) {return};
    const args = message.content
    .slice(process.env.PREFIX.length)
    .trim()
    .split(/ +/g);
    const cmd = args.shift().toLowerCase();
    if (cmd.length === 0) return;
    if (cmd === 'ping') {
      if (!message.inGuild()) {
          message.reply({
              contents: 'This command can only be executed inside the server.',
              ephemeral: true,
          });
          return;
      };

      // Cooldown
      const commandName = 'ping';
      const userId = message.author.id;
      let cooldown = await Cooldown.findOne({userId, commandName});
      if (cooldown && Date.now() < cooldown.endsAt) {
          const { default: prettyMs } = await import('pretty-ms');

          await message.channel.send(
              `⏰ Please wait ${prettyMs(cooldown.endsAt - Date.now())} to use this command.`
          );
          return;
      }

      if (!cooldown) {
          cooldown = new Cooldown({userId, commandName});
      };
      cooldown.endsAt = Date.now() + 5_000;
      await cooldown.save();

        let msg = await message.channel.send({
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
          let botPing = Math.floor(msg.createdAt - message.createdAt);
    
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
          message.reply({
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
                  text: `Request by ${message.author.globalName}`,
                  iconURL: `https://cdn.discordapp.com/avatars/${message.author.id}/${message.author.avatar}.webp?size=4096`,
                }),
            ],
          });
    }
}