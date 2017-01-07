// =========================================================== //
// ======================= [ Imports ] ======================= //

// external imports
var Discord = require("discord.js")
    , fs = require("fs-extra")
    , join = require("path").join
    , express = require("express")
    , bodyparser = require("body-parser");

// instantiate a new global Discord Client
global.client = new Discord.Client();

// imports from local directories
var config = require(join(__dirname, "config.json"))
    , commands = require(join(__dirname, "commands.json"));

global.__base = __dirname;

var getModsSync = function(dir) {
    let imports = {}
    , moduleFiles = fs.readdirSync(dir);

    for (let file of moduleFiles) {
        imports[file.replace(/\.(js)/g, "")] = require(join(dir, file));
    }

    console.log(Object.keys(imports));

    return imports;
}

// dynamically import custom command modules
global.modules = getModsSync(join(__dirname, "modules"));
// dynamically import custom utilities
global.utils = getModsSync(join(__dirname, "utils"));

// console.log(modules);

// =========================================================== //
// ======================= [ Express ] ======================= //

// create a new Express App which allows the handling of URIs
let app = new express();

// allow the use of url-based arguments
app.use(bodyparser.json());
// allow to POST to the server with extended functionality
app.use(bodyparser.urlencoded({ extended: true }));

// use routers for processing user activity on the webpanel
app.use(require(join(__dirname, "routers", "index.js")));

// ================================================================ //
// ======================= [ Discord Login ] ======================= //

global.handlers = new Discord.Collection();
// login to Discord using the token found inside the config
client.login(config.discord.loginToken)
    .then(() => {
        console.log("logged in!");
        app.listen(8080);

        fs.readdir(join(__dirname, "handlers"), (err, files) => {
            if (err) console.error(err);

            for (let handler of files) {
                if (/.*\.(js)/g.test(handler)) handlers.set(handler.replace(/\.(js)/g, ""), require(join(__dirname, "handlers", handler)));
            }
        });
    })
    // catch an error IF there is one
    .catch(console.error);