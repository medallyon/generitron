var fs = require("fs-extra")
, Discord = require("discord.js")
, join = require("path").join;

function rss(msg)
{
    if (!msg.guild) return msg.channel.sendMessage("This command is restricted to servers.");

    // construct the latest RSS and send how long for the next RSS Update
    if (msg.args.length === 0) {
        let embed = new Discord.RichEmbed();

        embed.setColor(utils.randColor())
        .setAuthor("RSS", client.user.avatarURL)
        .setTitle("Current state of your RSS")
        .setDescription(client.activeFeeds.get(msg.guild.id).rss.feed)
        .setFooter("Brought to you by Grogsile Industries Inc.!");

        msg.channel.sendMessage(embed);
    } else

    if (/(?:(?:https?:\/\/))[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,4}\b(?:[-a-zA-Z0-9@:%_\+.~#?&\/=]*\.(xml|rss))/g.test(msg.args[0])) {
        fs.readJson(join(__base, "data", "guilds", msg.guild.id, "SavedVars.json"), (err, savedVars) => {
            if (err) console.error(err);

            savedVars.rss.
        })
    }
}

module.exports = rss;