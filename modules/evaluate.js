var evaluate = function(msg)
{
    try {
        let evaluated = eval(msg.content.split(" ").slice(1).join(" "));
        msg.channel.sendMessage("```js\n" + evaluated + "```");
    } catch (err) {
        msg.channel.sendMessage("```js\n" + err + "```").then((errorMessage) => {
            msg.author.sendMessage(`Here's your stack ${(msg.guild) ? ("from **" + msg.guild.name + "** *#" + msg.channel.name + "*") : ""}\`\`\`js\n${err.stack}\`\`\``);
        });
    }
}

module.exports = evaluate;