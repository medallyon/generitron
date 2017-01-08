function evaluate(msg)
{
    try {
        let evaluated = eval(msg.args.join(" "));
        msg.channel.sendMessage("```js\n" + evaluated + "```");
    } catch (err) {
        msg.channel.sendMessage("```js\n" + err + "```").then((errorMessage) => {
            msg.author.sendMessage(`Here's your stack ${(msg.guild) ? ("from **" + msg.guild.name + "** *#" + msg.channel.name + "*") : ""}\`\`\`js\n${err.stack}\`\`\``);
        });
    }
}

module.exports = evaluate;