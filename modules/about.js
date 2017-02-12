const Discord = require("discord.js");

function about(msg)
{
    msg.channel.sendEmbed(new Discord.RichEmbed()
        .setColor(utils.randColor())
        .setAuthor(client.user.username, client.user.avatarURL, "https://grogsile.me/")
        .setDescription("*The most generic bot there is.*\nIt does generic things, from playing YouTube videos to simple role management.")
        .addField("About", "some paragraph about this bot", true)
        .addField("Website", "[Grogsile Inc.](https://esoi.grogsile.me/)", true)
        .addField("\u200B", "**Statistics**")
        .addField("Uptime", utils.getUptimeString(client.uptime), true)
        .addField("Guilds", client.guilds.size, true)
        .addField("Users", client.users.size, true)
        .setFooter("Brought to you by Grogsile Inc.", "https://i.grogsile.me/img/favicon.png")
        .setTimestamp(new Date())
    );
}

module.exports = about;