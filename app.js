﻿// imports
var Discord = require("discord.js")
    , fs = require("fs-extra")
    , path = require("path");

// imports from local directories
var config = require(path.join(__dirname, "config.json"))
    , commands = require(path.join(__dirname, "commands.json"));

// dynamically import modules
var modules = {};
let moduleFiles = fs.readdirSync(path.join(__dirname, "modules"));
moduleFiles.forEach(function(file) {
    if (/.*\.js/g.test(file))
        modules[file.replace(/\.js/g, "")] = require(path.join(__dirname, "modules", file));
});

// dynamically import utils
var utils = {};
let utilFiles = fs.readdirSync(path.join(__dirname, "utils"));
utilFiles.forEach(function(file) {
    if (/.*\.js/g.test(file)) {
        utils[file.replace(/\.js/g, "")] = require(path.join(__dirname, "utils", file));
    }
});

// instantiate a new Discord Client
global.client = new Discord.Client({ forceFetchUsers: true });

// ===================================================================
// ======================= [ Event Listeners ] =======================

// "ready" event, taking no parameter
client.once("ready", function () {
    console.log(`${client.user.username.toUpperCase()} is ready to serve ${client.guilds.size} guild${client.guilds.size == 1 ? "" : "s"}, accumulating ${client.users.size} user${client.users.size == 1 ? "" : "s"}.`);
});

// "message" event, taking 1 parameter: message
client.on("message", function (msg) {
    // set essential variables
    let guild = msg.guild
        , today = new Date()
        , consoleOutput = `\n${utils.getFullMonth(today.getUTCMonth()).slice(0, 3)} ${utils.getFullDay(today.getUTCDate())} ${today.getUTCFullYear()}\n${(msg.author.id === client.user.id ? "[YOU] " : "")}@${msg.author.username}: "${msg.content}"\n${msg.guild ? (msg.guild.name + " - [" + msg.channel.name + "]") : ("[Private Message]")}`
        , command;

    // log the formatted message
    console.log(consoleOutput);

    // return on bot message - we don't want to interfere with other bots
    if (msg.author.bot) return;

    // check whether user is using prefix or mention
    if (msg.content.split(" ")[0] === `<@${(guild && guild.member(client.user).nickname) ? "!" : ""}${client.user.id}>`)
        command = msg.content.split(" ")[1];
    else
        command = msg.content.split(" ")[0].slice(config.prefix.length);

    // handle a single @mention
    if (msg.mentions.users.has(client.user.id) && msg.content.split(" ").length === 1) {
        msg.channel.sendMessage("***Hey, that's pretty good!***");
    }

    // establish a command handler
    // for every command in the commands.json
    for (let cmd in commands) {

        // for every alias of the current command
        commands[cmd].forEach(alias => {

            // check if some alias matches the filtered command string
            if (command === alias) {

                // execute the command
                modules[cmd](msg);
            }
        });
    }
});

// ======================= [! Event Listeners !] =======================
// =====================================================================

// client login
client.login(config.discord.loginToken)
    .catch(err => {
        console.error(err.stack);
    });