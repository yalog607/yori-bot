require('dotenv/config');
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const UserProfile = require('../../../schemas/UserProfile');
const Cooldown = require('../../../schemas/Cooldown');
function getRandomNumber(x, y) {
    const range = y - x + 1;
    const randomNumber = Math.floor(Math.random() * range);
    return randomNumber + x;
}
const dailyAmount = getRandomNumber(9800, 31000);

module.exports = async (message, client) => {
    if (message.author.bot) return;
    if (!message.content.startsWith(process.env.PREFIX)) {return};
    const args = message.content
    .slice(process.env.PREFIX.length)
    .trim()
    .split(/ +/g);
    const cmd = args.shift().toLowerCase();
    if (cmd.length === 0) return;
    if (cmd === 'daily') {
        if (!message.inGuild()) {
            message.reply({
                contents: 'This command can only be executed inside the server.',
                ephemeral: true,
            });
            return;
        };
        try {
            let userProfile = await UserProfile.findOne({
                userId: message.author.id,
            });
            if (userProfile) {
                const lastDailyDate = userProfile.lastDailyCollected.toDateString();
                const currentDate = new Date().toDateString();

                if (lastDailyDate === currentDate) {
                    message.channel.send(`⚠️ You got your salary today, come back tomorrow.`);
                    return;
                }
            } else {
                userProfile = new UserProfile({
                    userId: message.author.id,
                });
            }
            userProfile.balance += dailyAmount;
            userProfile.lastDailyCollected = new Date();

            await userProfile.save();

            message.channel.send(
                `🎉 **${message.author.globalName}** +$${dailyAmount.toLocaleString('en-US')} has been added to your balance. \n💸 Your currently balance: $${userProfile.balance.toLocaleString('en-US')}.`
            )
        } catch (error) {
            console.error(error);
        }
    }
}