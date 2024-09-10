require('dotenv/config');
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const Cooldown = require('../../../schemas/Cooldown');
const UserProfile = require('../../../schemas/UserProfile');

module.exports = async (message) => {
    if (message.author.bot) return;
    if (!message.content.startsWith(process.env.PREFIX)) {return};
    const args = message.content
    .slice(process.env.PREFIX.length)
    .trim()
    .split(/ +/g);
    const cmd = args.shift().toLowerCase();
    if (cmd.length === 0) return;
    if (cmd === 'bal' || cmd === 'balance' || cmd === 'cash') {
        if (!message.inGuild()) {
            message.reply({
                content: 'This command can only be executed inside the server.',
                ephemeral: true
            });
            return;
        }
        // Cooldown
        const commandName = 'bal';
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
        cooldown.endsAt = Date.now() + 10_000;
        await cooldown.save();

        const targetUserId = message.author.id;
        try {
            let userProfile = await UserProfile.findOne({userId: targetUserId});
            if (!userProfile) {
                userProfile = new UserProfile({userId: targetUserId});
            }
            message.channel.send(
                `💸 **${message.author.globalName}** | Your currently balance is **$${userProfile.balance.toLocaleString('en-US')}**.`
            )
        } catch (error) {
            console.log(error);
        }
    }
}