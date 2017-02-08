var request = require("request")
, FeedParser = require("feedparser")
, Discord = require("discord.js");

function rss(msg) {
    if (!msg.guild) return msg.channel.sendMessage("This command may not be used outside of a server.");

    fs.readJson(`../data/guilds/${msg.guild.id}.json`, (err, guildConfig) => {
        if (err) console.error(err);

        let h = new Discord.RichEmbed();
        if (msg.args.length === 0) {
            h.setColor(utils.randColor());
            h.setAuthor()
        } else

        if (/https?:\/\/[a-z0-9\-\.\/]+\.(?:rss|xml)/g.test(msg.args[0].toLowerCase())) {
            guildConfig.rss.url = msg.args[0];
            return msg.channel.sendMessage("Your new RSS feed has been set!");
        } else

        if (false) {

        }
    });
}

module.exports = rss;