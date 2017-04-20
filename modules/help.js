var Discord = require("discord.js");

function help(msg)
{
    let h = new Discord.RichEmbed();

    h.setColor(utils.randColor());
    h.setAuthor("Help", client.user.avatarURL);
    h.setFooter("Brought to you by Grogsile Industries Inc.", "https://i.grogsile.me/img/favicon.png");
    h.setTimestamp(new Date());

    if (msg.args.length === 0) {
        h.setTitle("Commands");
        h.setDescription("Here is a list of commands. You can inspect each command by passing their name to the `help` command.");

        // iterate over every command in 'commands.json'
        for (let cmd in client.commands) {
            // add a field title 'command name', field description to 'command description',
            // and the in-line boolean paramater to 'true'
            h.addField(cmd, client.commands[cmd].description, true);
        }
        // add a final field to show an example of how a command could be used
        h.addField("Example Usage", `\`\`\`fix\n${client.config.prefix}help [command]\`\`\``);
    }

    else {
        // initialise a variable for the command specified in the arguments
        let command;
        // now iterate over every command
        for (let cmd in client.commands) {
            // check if any of the aliases in the 'commands.json' correspond to the user's input
            if (client.commands[cmd].alias.some(a => a === msg.args[0].toLowerCase())) {
                // set the command variable to to the command found
                command = client.commands[cmd];
                command.name = cmd;
                // break the statement to increase performance
                break;
            }
        }

        // if command is still empty (or 'null')
        if (!command) {
            // set the arguments to an empty array and execute the same module
            msg.args = [];
            // this will stop the code here and show the general window for the commands,
            // since the arguments array has been augmented here
            return help(msg);
        }

        // set the command title & description
        h.setTitle(command.name);
        h.setDescription(command.description);

        // add fields for the aliases
        h.addField("Aliases", command.alias.join(", "));
        // iterate over all the aliases
        for (let arg in command.arguments) {
            h.addField(arg + ((command.arguments[arg].optional) ? "" : "*"), command.arguments[arg].description);
        }
        // add a field for the example usage
        h.addField("Example Usage", `\`\`\`fix\n${client.config.prefix}${command.alias[0]} ${command.example}\`\`\``);
    }

    // send the Rich Embed to the user
    return msg.channel.sendEmbed(h).catch(console.error);
}

module.exports = help;
