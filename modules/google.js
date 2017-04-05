const Discord = require("discord.js")
, request = require("request")
, cheerio = require("cheerio");

const GOOGLE_DOMAIN = "http://google.com"
, GOOGLE_AVATAR = "https://lh4.googleusercontent.com/-v0soe-ievYE/AAAAAAAAAAI/AAAAAAADt5A/yxSJV_brsE4/s0-c-k-no-ns/photo.jpg";

function google(msg)
{
    request(GOOGLE_DOMAIN + `/search?q=${msg.args.join(" ")}`, (err, req, body) => {
        if (err) console.error(err);

        let $ = cheerio.load(body);
        let results = $("h3.r a");

        let embed = new Discord.RichEmbed()
            .setColor(utils.randColor())
            .setAuthor("Google", GOOGLE_AVATAR, GOOGLE_DOMAIN + `/search?q=${msg.args.join("+")}`)
            .setDescription($("div#resultStats").text().split("(")[0])
            .setThumbnail(GOOGLE_DOMAIN + $("img").attr("href"))
            .setFooter("Brought to you by Grogsile Inc.", client.user.avatarURL)
            .setTimestamp(new Date().toISOString());

        if (results.length)
        {
            for (let i = 0; i < ((results.length >= 3) ? 3 : results.length); i++)
            {
                embed.addField($(results[i]).text(), `[View Result](${GOOGLE_DOMAIN + $(results[i]).attr("href")})`, true);
            }
        } else return msg.channel.sendMessage("Your query did not yield any results.");

        msg.channel.sendEmbed(embed);
    });
}

module.exports = google;
