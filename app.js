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

// imports from local directories, globally available through client
client["config"] = require(join(__dirname, "config.json"))
, client["commands"] = require(join(__dirname, "commands.json"))
, client["savedVars"] = require(join(__dirname, "savedVariables.json"));

// declare a variable indicating the CWD, simply for convenience
global.__base = __dirname;

// function to synchronously import .js modules
const getModsSync = require("./utils/getModsSync.js");

// dynamically import custom command modules
global.modules = getModsSync(join(__dirname, "modules"));
// dynamically import custom utilities
global.utils = getModsSync(join(__dirname, "utils"));

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

// ================================================================= //
// ======================= [ Discord Login ] ======================= //

process.on('unhandledRejection', (reason, p) => {
    console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
    // application specific logging, throwing an error, or other logic here
});

// require all the handlers
require(join(__dirname, "handlers"));

// login to Discord using the token found inside the config
client.login(client.config.discord.loginToken)
    .then(() => {
        // once logged in, start the interactive web-panel
        app.listen(8080)
            .on("error", console.error);
    })
    // catch an error IF there is one
    .catch(console.error);
