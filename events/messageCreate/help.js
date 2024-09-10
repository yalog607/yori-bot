require('dotenv/config');
const { EmbedBuilder } = require('discord.js');
const Cooldown = require('../../schemas/Cooldown');
const config = require('../../config');

module.exports = async (message) => {
    if (message.author.bot) return;
    if (!message.content.startsWith(process.env.PREFIX)) {return};
    const args = message.content
    .slice(process.env.PREFIX.length)
    .trim()
    .split(/ +/g);
    const cmd = args.shift().toLowerCase();
    if (cmd.length === 0) return;
    if (cmd === 'help') {
        if (!message.inGuild()) {
            message.reply({
                contents: 'This command can only be executed inside the server.',
                ephemeral: true,
            });
            return;
        }; 
        // Cooldown
        const commandName = 'help';
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

        const exampleEmbed = new EmbedBuilder()
        .setColor(Math.floor(Math.random() * 0xffffff)
                .toString(16)
                .padStart(6, "0"))
        .setTitle('🍾 List commands available')
        .setDescription(`Prefix: ${process.env.PREFIX}`)
        .setAuthor({ name: `Yori`, iconURL: `https://cdn.discordapp.com/avatars/1144860424035127356/48a56e5f1c436bc188294dd79ba6753f.png?size=4096` })
        .addFields(config.help)
        // .addFields({
        //     name: 'Notes',
        //     value: '🤖 | The bot is still under development, if you encounter any errors, please use #support to join our support team and report your errors in **Feedback**'
        // })
        .setTimestamp()
        .setFooter({
            text: `Requested by ${message.author.globalName}`,
            iconURL: `https://cdn.discordapp.com/avatars/${message.author.id}/${message.author.avatar}.webp?size=4096`,
          });
    message.channel.send({ embeds: [exampleEmbed] });
    }
}