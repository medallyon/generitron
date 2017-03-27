const fs = require("fs-extra")
, join = require("path").join;

client.on("guildDelete", function(guild)
{
    fs.remove(join(__data, "guilds", guild.id), (err) => {
        if (err) console.error(`Failed to remove guild directory ${guild.name} (${guild.id}):\n${err.stack}`);
    });
});
