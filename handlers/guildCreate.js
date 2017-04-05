const fs = require("fs-extra")
, join = require("path").join;

client.on("guildCreate", function(guild)
{
    let config = {
        id: guild.id,
        rss: {
            enabled: false,
            feedURL: "",
            channel: guild.defaultChannel.id
        }
    }

    fs.outputJSON(join(__data, "guilds", guild.id), config, (err) => {
        if (err) console.error(`Failed to output config to guild ${guild.name} (${guild.id}):\n${err.stack}`);
    });
});
