// import external modules necessary for this project
var Discord = require("Discord.js")
, colors = require("colors/safe")
, fs = require("fs-extra")
, wikijs = require("wikijs");

// import external files, such as the config
var config = require("./config.json");

// initiate a new client from the Discord.js library
var client = new Discord.Client({ forceFetchUsers: true });

// set the theme for the console to make it less confusing
colors.setTheme({
    log: 'cyan',
    output: 'green',
    info: 'yellow',
    warn: 'red',
    error: 'red'
});

client.on("ready", function()
{
    console.log(colors.log("Logged in and ready to go!\nCurrently serving " + client.guilds.size + " guilds and " + client.users.size + " users."));          
})

client.login(config.token);