var fs = require("fs")
, join = require("path").join;

function getModsSync(dir)
{
    // initiate imports and read the module dir
    let imports = {}
    , moduleFiles = fs.readdirSync(dir);

    // for every file in the module dir, add it to imports
    for (let file of moduleFiles) {
        imports[file.replace(/\.(js)/g, "")] = require(join(dir, file));
    }

    // return the whole imports object
    return imports;
}

module.exports = getModsSync;
