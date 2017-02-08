// "message" event, taking 1 parameter: message
client.on("message", function (msg) {
    // this variable holds the time it was received
    msg["performance"] = Date.now();

    /**
     * today = {Object} Date
     * consoleOutput = {String} "[Formatted Timestamp] + [Author] + [Message Content] + [Message Location]"
     * command = {String} "[Command]"
     * args = {Array} [Command Arguments]
    **/
    let guild = msg.guild
        , today = new Date()
        , consoleOutput = `\n${utils.getFullMonth(today.getUTCMonth()).slice(0, 3)} ${utils.getFullDay(today.getUTCDate())} ${today.getUTCFullYear()}\n${(msg.author.id === client.user.id ? "[YOU] " : "")}@${msg.author.username}: "${(msg.content.length > 0) ? msg.content : "[Embed]"}"\n${msg.guild ? (msg.guild.name + " - [" + msg.channel.name + "]") : ("[Private Message]")}`
        , command, args;

    // log the formatted message
    console.log(consoleOutput);

    // return on bot message - we don't want to interfere with other bots
    if (msg.author.bot) return;

    // check whether user is using command prefix or mention to execute a command
    if (msg.content.split(" ")[0] === `<@${(guild && guild.member(client.user).nickname) ? "!" : ""}${client.user.id}>`) {
        command = msg.content.split(" ")[1];
        args = msg.content.split(" ").slice(2);
    }
    else {
        command = msg.content.split(" ")[0].slice(client.config.prefix.length);
        args = msg.content.split(" ").slice(1);
    }
    // create new variables ({command}, {args}) inside the {msg} object
    msg["command"] = command, msg["args"] = args;

    // handle a single @mention
    if (msg.mentions.users.has(client.user.id) && msg.content.split(" ").length === 1) {
        msg.channel.sendMessage("***Hey, that's pretty good!***");
    }

    // establish a command handler for
    // every command in the commands.json
    // 
    // check if the command prefix exists
    if (msg.content.split(" ")[0].slice(0, msg.content.split(" ")[0].indexOf(command)) === client.config.prefix) {

        // iterate through all commands
        for (let cmd in client.commands) {

            // for every alias of the current command
            for (let alias of client.commands[cmd].alias) {

                // check if some alias matches the filtered command string
                if (command === alias) {

                    // check if the member actually has permission to execute the command
                    if (utils.hasPermission(client.commands[cmd], msg.member)) {

                        // execute the command
                        return modules[cmd](msg);
                    }
                }
            }
        }
    }
});