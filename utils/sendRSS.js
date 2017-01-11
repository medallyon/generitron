var Discord = request("discord.js");

function sendRSS(guild, article)
{
    let config = client.activeFeeds.get(guild.id)
    , embed = new Discord.RichEmbed();

    // construct the new embed
    embed.setColor(utils.randColor())
    .setAuthor(article.author, image || guild.iconURL, article.link)
    .setTitle(article.title)
    .setDescription(article.description)
    .setImage(article.image || "")
    .setFooter("Provided to you by Grogsile Industries Inc.!", "https://i.grogsile.me/img/favicon.png")
    .setTimestamp(article.pubDate || new Date());

    client.channels.get(config.rss.channel).sendEmbed(embed)
        .catch(console.error);
}

module.exports = sendRSS;