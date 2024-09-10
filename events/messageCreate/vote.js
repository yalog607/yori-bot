require('dotenv/config');
const Cooldown = require('../../schemas/Cooldown');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const UserProfile = require('../../schemas/UserProfile');
function getRandomNumber(x, y) {
    const range = y - x + 1;
    const randomNumber = Math.floor(Math.random() * range);
    return randomNumber + x;
}
const voteAmount = getRandomNumber(12000, 30000);

module.exports = async (message, client) => {
    if (message.author.bot) return;
    if (!message.content.startsWith(process.env.PREFIX)) {return};
    const args = message.content
    .slice(process.env.PREFIX.length)
    .trim()
    .split(/ +/g);
    const cmd = args.shift().toLowerCase();
    if (cmd.length === 0) return;
    if (cmd === 'vote') {
        if (!message.inGuild()) {
            message.reply({
                contents: 'This command can only be executed inside the server.',
                ephemeral: true,
            });
            return;
        };

        // Cooldown
        const commandName = 'vote';
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

        const userProfile = await UserProfile.findOne({userId: message.author.id});
        userProfile.balance += voteAmount;
        await userProfile.save();
        message.channel.send({
            content: 'Click the link below to vote for the bot!\nWhen you vote for the bot, the bot will automatically add money to you (from $12,00 to $30,000)\n\nVote now ⤵️\n',
            components: [
                new ActionRowBuilder().setComponents(
                  new ButtonBuilder()
                    .setLabel("🔗 Click here")
                    .setStyle(ButtonStyle.Link)
                    .setURL(`https://top.gg/bot/${process.env.CLIENT_ID}/vote`)
                ),
              ],
        });        
        return;
    }
}