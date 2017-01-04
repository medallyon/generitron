var fs = require("fs-extra")
, path = require("path");

// function to import modules dynamically
// "import" fn name is reserved in ES6
var getModsSync = (dir, extensions) => {
    let imports = {}
    , moduleFiles = fs.readdirSync(dir);

    let allowedRegExp = new RegExp(`.*\.(${extensions.join("|")})`, "g")
    , replaceRegExp = new RegExp(`\.(${extensions.join("|")})`, "g");

    for (let file of moduleFiles) {
        if (allowedRegExp.test(file)) {
            imports[file.replace(replaceRegExp, "")] = require(path.join(dir, file));
        }
    }

    return imports;
}

module.exports = getModsSync;