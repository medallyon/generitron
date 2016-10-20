// import external modules necessary for this project
var Discord = require("Discord.js")
, colors = require("colors")
, fs = require("fs-extra")
, wikijs = require("wikijs");

// import external files, such as the config
var config = require("./config.json");

// initiate a new client from the Discord.js library
var client = new Discord.Client({ forceFetchUsers: true });

client.login(config.token);