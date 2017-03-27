const fs = require("fs-extra")
, join = require("path").join;

function readConfig(guild)
{
    return new Promise(function(resolve, reject)
    {
        fs.readJson(join(__data, "guilds", guild.id, "config.json"), (err, config) => {
            if (err) reject(err);
            else resolve(config);
        });
    });
}

module.exports = readConfig;
