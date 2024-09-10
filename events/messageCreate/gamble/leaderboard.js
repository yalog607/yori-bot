require('dotenv/config');
const { EmbedBuilder } = require('discord.js');
const Cooldown = require('../../../schemas/Cooldown');
const UserProfile = require('../../../schemas/UserProfile');

module.exports = async (message, client) => {
    if (message.author.bot) return;
    if (!message.content.startsWith(process.env.PREFIX)) {return};
    const args = message.content
    .slice(process.env.PREFIX.length)
    .trim()
    .split(/ +/g);
    const cmd = args.shift().toLowerCase();
    if (cmd.length === 0) return;
    if (cmd === 'leaderboard') {
        if (!message.inGuild()) {
            message.reply({
                contents: 'This command can only be executed inside the server.',
                ephemeral: true,
            });
            return;
        };

        // Cooldown
        const commandName = 'leaderboard';
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
        cooldown.endsAt = Date.now() + 15_500;
        await cooldown.save();
        
        const {username, id} = message.author;
        const userProfile = await UserProfile.findOne({userId: id});
        if (!userProfile) {
            userProfile = new UserProfile({
                userId: message.author.id
            })
        };
        const balance = userProfile.balance;

        let leaderboardEmbed = new EmbedBuilder()
            .setTitle(`**🏆 Yori currency chart | ${message.guild.name}**`)
            .setColor('#ffd966')
            .setFooter({ text: 'Your name is not on the chart.'});

        const members = await UserProfile
            .find()
            .sort({balance: -1})
            .catch(err => console.log(err));

        const memberIdx = members.findIndex((member) => member.userId === id);

        leaderboardEmbed.setFooter({text: `${username} | You rank #${memberIdx + 1} with $${balance.toLocaleString('en-US')}`,
        iconURL: `https://cdn.discordapp.com/avatars/${message.author.id}/${message.author.avatar}.webp?size=4096`});
        
        const topTen = members.slice(0, 10);
        const guild = await client.guilds.fetch(message.guild.id);
        let desc = "";
        guild.members.fetch().then(members => {
            const userIDs = [...members.keys()];
            let y = 0;
            for (let i = 0; i < topTen.length; i++) {
                if (userIDs.includes(topTen[i].userId)) {
                    let userBalance = topTen[i].balance;
                    let user = client.users.cache.get(topTen[i].userId);
                    desc += `#${y+1} | ${user.username}: **$${userBalance.toLocaleString('en-US')}**\n`;
                    y++;
                }
            };
            leaderboardEmbed.setDescription(`${desc}`);
            return message.channel.send({embeds: [leaderboardEmbed]});
            })
    }
}