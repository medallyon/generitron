const Discord = require("discord.js")
, fs = require("fs-extra")
, join = require("path").join
, request = require("request")
, FeedParser = require("feedparser");

// returns a Promise that resolves in an RSS feed item
function checkUpdate(config)
{
    // initialise the Promise
    return new Promise(function(resolve, reject)
    {
        // set up a variable that determines if the first item in a feed has been processed
        let first = true
        // set up a variable that will hold the data of the item, including metadata
        , newest = {};

        // create a request to the specified feed URI
        request(config.rss.feedURL)
            // pipe it into a new feedparser instance
            .pipe(new FeedParser())
            // ... which might error ...
            .on("error", reject)
            // ... receive some metadata ...
            .on("meta", meta => {
                newest.meta = meta;
            })
            // ... and finally process item data
            .on("readable", function()
            {
                // I'm not entirely sure how this works, but as long as it does, I think we're good!
                let stream = this
                , item;

                while (item = stream.read()) {
                    // check whether the first item has already been accessed or not
                    if (first)
                    {
                        // set the 'first' variable to false to indicate that the first item has been accessed
                        first = false;
                        // create a constant variable 'tempItem' that holds the current item
                        // this is necessary since we're working with async code, which means
                        // one operation might take longer than another.
                        const tempItem = item;

                        // read this guild's saved variables
                        fs.readJson(join(__data, "guilds", config.id, "rss", "latestItem.json"), (err, latest) => {
                            if (err) reject(err);

                            // check if the latest item in the feed is actually new
                            if (tempItem.pubDate !== latest.pubDate)
                            {
                                // output the latest item to a file for future comparison
                                fs.outputJson(join(__data, "guilds", config.id, "rss", "latestItem.json"), tempItem, (err) => console.error(err));

                                // resolve with the newest item
                                newest.item = tempItem;
                                resolve(newest);
                            // otherwise 'reject' the Promise
                            } else reject();
                        });
                    }
                }
            });
        });
}

// a helper function that returns a Discord Rich Embed
function constructEmbed(item, meta, guild)
{
    // fill the embed with relevant data
    return new Discord.RichEmbed()
        .setColor(utils.randColor())
        .setAuthor(item.author || item.creator || meta.title || "RSS Update", "", meta.link || "")
        .setTitle(item.title)
        .setURL(item.link)
        .setDescription(item.description || item.summary)
        .setImage(meta.image.url || meta.image || "")
        .setFooter("Brought to you by Grogsile Inc.", client.user.avatarURL)
        .setTimestamp(item.pubDate || new Date().toISOString());
}

// the main function
function rss(msg)
{
    // read the config of a guild
    utils.readConfig(msg.guild)
        .then(config => {
            // check if that guild has the RSS feature enabled
            if (config.rss.enabled)
            {
                // execute 'checkUpdate'
                checkUpdate(config)
                .then(obj => {
                    // finally send the new data off to the guild
                    client.channels.get(config.rss.channel).sendEmbed(constructEmbed(obj.item, obj.meta, msg.guild))
                        .catch(console.error);
                }).catch(console.log);
            }
        }).catch(console.error);
}

// set an interval to execute 'rss' every 90 minutes
setInterval(function()
{
    // iterate over all guilds
    for (let guild of client.guilds)
    {
        // execute the main function
        rss({ guild: guild });
    }
}, 5400000);

// export the module
module.exports = rss;
