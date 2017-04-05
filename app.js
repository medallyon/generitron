// =========================================================== //
// ======================= [ Imports ] ======================= //

// external imports
var Discord = require("discord.js")
    , fs = require("fs-extra")
    , join = require("path").join
    , Express = require("express")
    , bodyparser = require("body-parser")
    , watch = require("watch")
    , decache = require("decache");

// define paths for module directories
const MODULES_PATH = join(__dirname, "modules")
, UTILS_PATH = join(__dirname, "utils")
, ROUTERS_PATH = join(__dirname, "routers")
, HANDLERS_PATH = join(__dirname, "handlers");

// instantiate a new global Discord Client
global.client = new Discord.Client();

// imports from local directories, globally available through client
client["config"] = require(join(__dirname, "config.json"))
, client["commands"] = require(join(__dirname, "commands.json"))
, client["savedVars"] = require(join(__dirname, "savedVariables.json"))

, client["parties"] = new Discord.Collection();

// declare a variable indicating the CWD, simply for convenience
global.__base = __dirname;
global.__data = join(__dirname, "data");

// function to synchronously import .js modules
const getModsSync = require("./utils/getModsSync.js");

// dynamically import custom command modules
global.modules = getModsSync(join(__dirname, "modules"));
// dynamically import custom utilities
global.utils = getModsSync(join(__dirname, "utils"));

// ========================================================= //
// ======================= [ Watch ] ======================= //

// start watching modules
watch.watchTree(MODULES_PATH, {
    ignoreDotFiles: true,
    filter: (x) => x.endsWith(".js"),
    interval: 10
}, function(file, curr, prev) {
    if (typeof file == "object" && prev === null && curr === null) return;
    console.log("\nattempting to recache " + file.replace(/.*\\/g, ""));
    decache(file);
    modules[file.replace(/.*\\/g, "").replace(".js", "")] = require(file);
});

// start watching utils
watch.watchTree(UTILS_PATH, {
    ignoreDotFiles: true,
    filter: (x) => x.endsWith(".js"),
    interval: 10
}, function(file, curr, prev) {
    if (typeof file == "object" && prev === null && curr === null) return;
    console.log("\nattempting to recache " + file.replace(/.*\\/g, ""));
    decache(file);
    utils[file.replace(/.*\\/g, "").replace(".js", "")] = require(file);
});

// =========================================================== //
// ======================= [ Express ] ======================= //

// create a new Express App which allows the handling of URIs
let app = new Express();

// allow the use of url-based arguments
app.use(bodyparser.json());
// allow to POST to the server with extended functionality
app.use(bodyparser.urlencoded({ extended: true }));

// set the view engine to 'ejs', which allows semi-dynamic website rendering
app.set("view engine", "ejs");
// set the views directory
app.set("views", join(__dirname, "wwwroot", "views"));

// make all resources available
app.use(require(join(__dirname, "routers", "resources.js")));

// use routers for processing user activity on the webpanel
app.use(require(join(__dirname, "routers", "index.js")));

// introduce the dashboard router which will handle all activity on /dashboard
app.use(require(join(__dirname, "routers", "dashboard.js")));

// ================================================================= //
// ======================= [ Discord Login ] ======================= //

// cheap error catching
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
        app.listen(8787)
            .on("error", console.error);
    })
    // catch an error IF there is one
    .catch(console.error);
