require('dotenv/config');
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const UserProfile = require('../../../schemas/UserProfile');
const Cooldown = require('../../../schemas/Cooldown');

module.exports = async (message, client) => {
    if (message.author.bot) return;
    if (!message.content.startsWith(process.env.PREFIX)) {
    return;
    }
    const args = message.content
    .slice(process.env.PREFIX.length)
    .trim()
    .split(/ +/g);
    const cmd = args.shift().toLowerCase();
    if (cmd.length === 0) return;
    if (cmd === 'bank' || cmd === 'give' || cmd === 'transfer') {
        if (!message.inGuild()) {
            message.reply({
                contents: 'This command can only be executed inside the server.',
                ephemeral: true,
            });
            return;
        };
        // Cooldown
        const commandName = 'bank';
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
        cooldown.endsAt = Date.now() + 12_500;
        await cooldown.save();

        const targetUser = args[0].slice(2,-1);
        const amount = args[1];
        if (amount < 100) {
            message.channel.send('⚠️ The minimum amount to transfer is $100.');
            return;
        };
        if (amount > 5000000) {
            message.channel.send('⚠️ The maximum amount to transfer is $5,000,000.');
            return;
        };
        if (!targetUser) {
            message.channel.send('⚠️ Invalid user.');
            return;
        }
        
        let userProfile = await UserProfile.findOne({userId: message.author.id});
        let targetUserProfile = await UserProfile.findOne({userId: targetUser});
    
        if (!userProfile) {
            userProfile = new UserProfile({
                userId: message.author.id
            })
        };
        if (!targetUserProfile) {
            targetUserProfile = new UserProfile({
                userId: targetUser
            })
        };
    
        if (amount > userProfile.balance) {
            message.channel.send(`⚠️ You don't have enough money to transfer $${amount.toLocaleString('en-US')}`);
            return;
        };
        const amountWin = Number(amount);
        userProfile.balance = Number(userProfile.balance) - Number(amount);
        targetUserProfile.balance = Number(targetUserProfile.balance) + Number(amount);
        await userProfile.save();
        await targetUserProfile.save();
    
        message.channel.send(`💳 | **${message.author.globalName}**, successfully transfer $${amountWin.toLocaleString('en-US')} to <@${targetUser}>!\n💸 Your currently balance: $${userProfile.balance.toLocaleString('en-US')}`);
    }
}