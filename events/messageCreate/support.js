require('dotenv/config');
const Cooldown = require('../../schemas/Cooldown');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = async (message, client) => {
    if (message.author.bot) return;
    if (!message.content.startsWith(process.env.PREFIX)) {return};
    const args = message.content
    .slice(process.env.PREFIX.length)
    .trim()
    .split(/ +/g);
    const cmd = args.shift().toLowerCase();
    if (cmd.length === 0) return;
    if (cmd === 'support') {
        if (!message.inGuild()) {
            message.reply({
                contents: 'This command can only be executed inside the server.',
                ephemeral: true,
            });
            return;
        };

        // Cooldown
        const commandName = 'support';
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

        message.channel.send({
            content: 'Click the button below to join the bot\'s support guild!\nClick here ⤵️\n',
            components: [
                new ActionRowBuilder().setComponents(
                  new ButtonBuilder()
                    .setLabel("🔗 Tham gia | Join")
                    .setStyle(ButtonStyle.Link)
                    .setURL(`https://discord.com/invite/cyxSNtHBKF`)
                ),
              ],
        })
    }
}