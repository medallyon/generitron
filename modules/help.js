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

        for (let cmd in client.commands) {
            h.addField(cmd, client.commands[cmd].description, true);
        }
        h.addField("Example Usage", `\`\`\`fix\n${client.config.prefix}help [command]\`\`\``);
    }

    else {
        let command;
        for (let cmd in client.commands) {
            if (client.commands[cmd].alias.some(a => a === msg.args[0].toLowerCase())) {
                command = client.commands[cmd];
                command.name = cmd;
                break;
            }
        }

        if (!command) {
            msg.args = [];
            return help(msg);
        }

        h.setTitle(command.name);
        h.setDescription(command.description);

        h.addField("Aliases", command.alias.join(", "));
        for (let arg in command.arguments) {
            h.addField(arg + ((command.arguments[arg].optional) ? "" : "*"), command.arguments[arg].description);
        }
        h.addField("Example Usage", `\`\`\`fix\n${client.config.prefix}${command.alias[0]} ${command.example}\`\`\``);
    }

    return msg.channel.sendEmbed(h).catch(console.error);
}

module.exports = help;