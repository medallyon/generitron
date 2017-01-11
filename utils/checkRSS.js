var fs = require("fs-extra")
, FeedParser = require("feedparser");

function checkRSS(guild, config)
{
    return new Promise(resolve, reject) {
        let req = request(client.activeFeeds.get(guild.id).rss.feed)
        , feedparser = new FeedParser();

        req.on("error", reject);

        req.on("response", (res) => {
            // `this` is `req`, which is a stream
            let stream = this;

            if (res.statusCode !== 200) {
                reject(new Error("Bad status code: " + res.statusCode));
            }
            else {
                stream.pipe(feedparser);
            }
        });

        feedparser.on("error", reject);

        let first = true;
        feedparser.on("readable", () => {
            // `this` is `feedparser`, which is a stream
            let stream = this
            , meta = this.meta
            , item;

            while (item = stream.read()) {
                if (first) {
                    fs.readJson(`../data/guilds/${guild.id}/SavedVars.json`, (err, savedVars) => {
                        if (err) reject(err);

                        if (savedVars.rss.latest.title === item.title && savedVars.rss.latest.timestamp === Date.parse(item.pubDate)) {
                            resolve(item);
                        } else {
                            reject({ name: "NOUPDATE" });
                        }
                    });
                }
                first = false;
            }
        });
    }
}

module.exports = checkRSS;