// "ready" event, taking no parameter
client.once("ready", function () {
    // log a formatted string to the console to signify that the script is ready
    console.log(`${client.user.username.toUpperCase()} is ready to serve ${client.guilds.size} guild${client.guilds.size == 1 ? "" : "s"}, accumulating ${client.users.size} user${client.users.size == 1 ? "" : "s"}.`);

    client["activeFeeds"] = new Discord.Collection();
    fs.readdir("../data/guilds", (err, files) => {
        if (err) console.error(err);

        let confs = new Discord.Collection();
        for (let f in files) {
            let guildId = f.replace(".json", "");
            confs.set(guildId, fs.readJsonSync(`../data/guilds/${files[f]}/Config.json`));
            if (confs.get(guildId).rss.enabled) {
                client.activeFeeds.set(guildId, guildConfig);
            }
        }

        setInterval(function() {
            client.activeFeeds.set("counter", Date.now());
            for (let guild of client.guilds) {
                utils.checkRSS(guild, confs.get(guild.id))
                    .then((guild, article) => {
                        utils.sendRSS(guild, article);
                    }).catch(err => {
                        if (err.name !== "NOUPDATE") console.error(err);
                    });
            }
        }, 30 * 60 * 1000);
    });
});