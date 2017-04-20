const Discord = require("discord.js");

function about(msg)
{
    msg.channel.sendEmbed(new Discord.RichEmbed()
        .setColor(utils.randColor())
        .setAuthor(client.user.username, client.user.avatarURL, "https://grogsile.me/")
        .setDescription("This bot is here to help you.\nIt does a range of things including the ability to play YouTube music in voice channels to fetch information from Wikipedia. To get started, type `!help`.")
        .addField("Website", "[Grogsile Inc.](https://apps.grogsile.me/)", true)
        .addField("\u200B", "**Statistics**")
        .addField("Uptime", utils.getUptimeString(client.uptime), true)
        .addField("Guilds", client.guilds.size, true)
        .addField("Users", client.users.size, true)
        .setFooter("Brought to you by Grogsile Inc.", "https://i.grogsile.me/img/favicon.png")
        .setTimestamp(new Date())
    );
}

module.exports = about;
