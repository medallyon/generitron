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
, client["commands"] = require(join(__dirname, "commands.json"));

// declare a variable indicating the CWD, simply for convenience
global.__base = __dirname;

// function to synchronously import .js modules
var getModsSync = function(dir) {
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

// ================================================================ //
// ======================= [ Discord Login ] ======================= //

// initiate a global handlers Collection
global.handlers = new Discord.Collection();
// login to Discord using the token found inside the config
client.login(client.config.discord.loginToken)
    .then(() => {
    	// once logged in, start the interactive web-panel
        app.listen(8080)
            .on("error", console.error);

        // read the directory for the handlers
        fs.readdir(join(__dirname, "handlers"), (err, files) => {
            if (err) console.error(err);

            // import each of the handlers into the cache
            for (let handler of files) {
                if (/.*\.(js)/g.test(handler)) handlers.set(handler.replace(/\.(js)/g, ""), require(join(__dirname, "handlers", handler)));
            }
        });
    })
    // catch an error IF there is one
    .catch(console.error);