const Discord = require("discord.js")
, request = require("request")
, cheerio = require("cheerio");

const WIKI_API = "https://en.wikipedia.org/w/api.php"
, WIKI_AVATAR = "https://upload.wikimedia.org/wikipedia/en/thumb/8/80/Wikipedia-logo-v2.svg/1122px-Wikipedia-logo-v2.svg.png"
, WIKI_DOMAIN = "https://en.wikipedia.org/wiki";

function filterImages(images)
{
    return images.filter(i => !i.endsWith(".svg"));
}

function fetchSummary(query)
{
    return new Promise(function(resolve, reject)
    {
        request(`${WIKI_API}?action=parse&page=${query}&prop=text|images&section=0&format=json`, (err, req, body) => {
            if (err) reject(err);

            let $ = cheerio.load(JSON.parse(body).parse.text["*"]);
            let description = $("p").text();

            if (description.split("\n").length > 3) description = description.split("\n")[0] + "\n" + description.split("\n")[1] + "\n" + description.split("\n")[2];
            if (description.split(" ").length > 200) description = description.split(" ").slice(0, 200).join(" ") + "...";

            if (filterImages(JSON.parse(body).parse.images).length)
            {
                let filteredImage = filterImages(JSON.parse(body).parse.images)[0];
                request(`${WIKI_DOMAIN}/File:${filteredImage}`, (err2, req2, body2) => {
                    if (err2) reject(err2);

                    let $img = cheerio.load(body2);
                    let image = "http:" + $img("img[alt^=\"File:\"]").attr("src");

                    resolve({ description: description, image: image });
                });
            } else resolve({ description: description, image: "" });
        });
    });
}

function wikipedia(msg)
{
    request(`${WIKI_API}?action=query&list=search&srsearch=${msg.args.join("%20")}&format=json&srlimit=1`, (err, req, body) => {
        if (err) console.error(err);

        let query = JSON.parse(body).query
        , suggestion = JSON.parse(body).query.suggestion
        , embed = new Discord.RichEmbed()
            .setColor(utils.randColor())
            .setFooter("Brought to you by Grogsile Inc.", client.user.avatarURL)
            .setTimestamp(new Date().toISOString());

        let searchFor;
        if (query.search[0]) searchFor = query.search[0].title;
        else if (query.searchinfo.suggestion) searchFor = query.searchinfo.suggestion;
        else return msg.channel.sendMessage(`I could not find anything under \`${msg.args.join(" ")}\``);

        fetchSummary(searchFor)
            .then(summary => {
                embed.setAuthor(query.search[0].title, WIKI_AVATAR, `${WIKI_DOMAIN}/${query.search[0].title.split(" ").join("_")}`)
                    .setDescription(summary.description)
                    .setThumbnail(summary.image);

                msg.channel.sendEmbed(embed);
            }).catch(console.error);
    });
}

module.exports = wikipedia;
