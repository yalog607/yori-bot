require('dotenv/config');
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const UserProfile = require('../../../schemas/UserProfile');
const Cooldown = require('../../../schemas/Cooldown');
function getRandomNumber(x, y) {
    const range = y - x + 1;
    const randomNumber = Math.floor(Math.random() * range);
    return randomNumber + x;
}

module.exports = async (message, client) => {
    if (message.author.bot) return;
    if (!message.content.startsWith(process.env.PREFIX)) {return};
    const args = message.content
    .slice(process.env.PREFIX.length)
    .trim()
    .split(/ +/g);
    const cmd = args.shift().toLowerCase();
    if (cmd.length === 0) return;
    if (cmd === 'work') {
        if (!message.inGuild()) {
            await message.reply({
                content: 'This command can only be executed inside the server.',
                ephemeral: true
            });
            return;
        }
        try {            
            const commandName = 'work';
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
            }
            const amount = getRandomNumber(890, 5000);

            let userProfile = await UserProfile.findOne({userId}).select('userId balance');

            if (!userProfile) {
                userProfile = new UserProfile({userId});
            }

            userProfile.balance += amount;
            cooldown.endsAt = Date.now() + 300_000;

            await Promise.all([cooldown.save(), userProfile.save()]);

            await message.channel.send(`🎉 **${message.author.globalName}**, you received +$${amount.toLocaleString('en-US')} thanks to a part-time job! \n💸 Your currently balance: $${userProfile.balance.toLocaleString('en-US')}`)
        } catch (error) {
            console.log(error);
        }
    }
}