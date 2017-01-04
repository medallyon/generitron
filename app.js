// =========================================================== //
// ======================= [ Imports ] ======================= //

// external imports
var Discord = require("discord.js")
    , fs = require("fs-extra")
    , path = require("path")
    , express = require("express")
    , bodyparser = require("body-parser");

// imports from local directories
var config = require(path.join(__dirname, "config.json"))
    , commands = require(path.join(__dirname, "commands.json"));

global.__base = __dirname;

global.utils = {};
utils["getModsSync"] = require(path.join(__dirname, "utils", "getModsSync.js"));

// dynamically import custom command modules
global.modules = utils.getModsSync(path.join(__dirname, "modules"), ["js"]);
// dynamically import custom utilities
global.utils = utils.getModsSync(path.join(__dirname, "utils"), ["js"]);

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
app.use(require(path.join(__dirname, "routers", "index.js")));

// ================================================================ //
// ======================= [ Discord Login ] ======================= //

// instantiate a new global Discord Client
global.client = new Discord.Client({ forceFetchUsers: true });

// login to Discord using the token found inside the config
client.login(config.discord.loginToken)
    .then(() => {
        console.log("logged in!");
        app.listen(8080);
    })
    // catch an error IF there is one
    .catch(console.error);