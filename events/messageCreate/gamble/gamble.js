require('dotenv/config');
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const UserProfile = require('../../../schemas/UserProfile');
const config = require('../../../config');
const Cooldown = require('../../../schemas/Cooldown');
function getRandomNumber(x, y) {
    const range = y - x + 1;
    const randomNumber = Math.floor(Math.random() * range);
    return randomNumber + x;
}
const timeRandom = getRandomNumber(500, 1997);

module.exports = async (message, client) => {
    if (message.author.bot) return;
    if (!message.content.startsWith(process.env.PREFIX)) {return};
    const args = message.content
    .slice(process.env.PREFIX.length)
    .trim()
    .split(/ +/g);
    const cmd = args.shift().toLowerCase();
    if (cmd.length === 0) return;
    if (cmd === 'gamble' || cmd === 'gb') {
        if (!message.inGuild()) {
            message.reply({
                contents: 'This command can only be executed inside the server.',
                ephemeral: true,
            });
            return;
        };
        let userProfile = await UserProfile.findOne({userId: message.author.id});
        if (!userProfile) {
            userProfile = new UserProfile({
                userId: message.author.id
            })
        };
        // Cooldown
        const commandName = 'gb';
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
        cooldown.endsAt = Date.now() + 6_000;
        await cooldown.save();

        if (!args[0]) {return;}
        let amount = args[0];
        if (!typeof(amount) === 'Number') {
            return;
        }
        if (amount === 'all') {
            amount = userProfile.balance;
        }
        if (Number(amount) != amount) {
            amount = 1;
        }
        if (amount < 1) {
            message.reply('⚠️ Minimum bet is $1.');
            return;
        };
        if (amount > 300000) {
          amount = 300000;
      };
    
        if (amount > userProfile.balance) {
            message.reply(`⚠️ You don't have enough money to bet $${amount.toLocaleString('en-US')}`);
            return;
        };
        const didWin = Math.random() >= 0.4;
        
        if (!didWin) {
            const amountWon = Number(amount);
            let msg = await message.channel.send(`🪙 **${message.author.globalName}** bet **$${amountWon.toLocaleString('en-US')}**!`);
            userProfile.balance -= amount;
            await userProfile.save();
            await setTimeout(() => {
              msg.edit(`🪙 **${message.author.globalName}** bet **$${amountWon.toLocaleString('en-US')}**!\n🎟️ Result: You **lost** it all -$${amount.toLocaleString('en-US')} | 💸 Your currently balance: **$${userProfile.balance.toLocaleString('en-US')}**.`);
            },timeRandom)
            return;
        };
        const amountWon = Number(amount);
        let msg = await message.channel.send(`🪙 **${message.author.globalName}** bet **$${amountWon.toLocaleString('en-US')}**!`);
        userProfile.balance += amountWon;
        await userProfile.save();
    
        await setTimeout(() => {
          msg.edit(`🪙 **${message.author.globalName}** bet **$${amountWon.toLocaleString('en-US')}**!\n🎉 Result: You **won** +$${amountWon.toLocaleString('en-US')} | 💸 Your currently balance: **$${userProfile.balance.toLocaleString('en-US')}**.`);
        },timeRandom);
        return;
    }
}