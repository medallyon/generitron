var fs = require("fs-extra")
, Discord = require("discord.js");

class Tower
{
    constructor(full)
    {
        this.pole = [];
        this.pointer = 0;
        if (full) this.pole = [3, 2, 1];
    }

    push(discValue)
    {
        if (this.pointer === 0 || this.pole[this.pointer] > discValue) {
            this.pointer++;
            this.pole[this.pointer] = discValue;
        }
    }

    pop()
    {
        let deleted = this.pole.splice(this.pointer, 1);
        this.pointer--;
        return deleted[0];
    }
}

var constructASCII = function(towers)
{
    return (`┌───┬───┬───┐
│ ${towers.left[2] || " "} │ ${towers.middle[2] || " "} │ ${towers.right[2] || " "} │
│ ${towers.left[1] || " "} │ ${towers.middle[1] || " "} │ ${towers.right[1] || " "} │
│ ${towers.left[0] || " "} │ ${towers.middle[0] || " "} │ ${towers.right[0] || " "} │
└───┴───┴───┘`)
}

var handle = function(user)
{
    let session = client.hanoi.get(user.id);

    session.collector.on("message", function(msg) {
        msg.content = msg.content.toLowerCase();

        if (msg.content.split(" ").indexOf("left") > -1) {
            if (msg.content.split(" ").indexOf("left") < msg.content.split(" ").indexOf("middle")) {
                session.middle.push(session.left.pop());
            } else

            if (msg.content.split(" ").indexOf("left") < msg.content.split(" ").indexOf("right")) {
                session.right.push(session.left.pop());
            }
        }

        if (msg.content.split(" ").indexOf("middle") > -1) {
            if (msg.content.split(" ").indexOf("middle") < msg.content.split(" ").indexOf("left")) {
                session.left.push(session.middle.pop());
            } else

            if (msg.content.split(" ").indexOf("middle") < msg.content.split(" ").indexOf("right")) {
                session.right.push(session.middle.pop());
            }
        }

        if (msg.content.split(" ").indexOf("right") > -1) {
            if (msg.content.split(" ").indexOf("right") < msg.content.split(" ").indexOf("left")) {
                session.left.push(session.right.pop());
            } else

            if (msg.content.split(" ").indexOf("right") < msg.content.split(" ").indexOf("middle")) {
                session.middle.push(session.right.pop());
            }
        }

        msg.channel.sendMessage(`\`\`\`fix\n${constructASCII({ left: session.left, middle: session.middle, right: session.right, })}\`\`\``);
    });

    session.collector.on("end", function(collected) {

    });
}

var hanoi = function(msg)
{
    if (!client.hanoi) client["hanoi"] = new Discord.Collection();

    if (msg.args.length === 0) {
        // return some information on their current score here
    } else

    if (msg.args[0].toLowerCase() === "new") {
        if (client.hanoi.has(msg.author.id)) client.hanoi.delete(msg.author.id);
        msg.channel.sendMessage("A new game of `Towers of Hanoi` has been initiated. Please see your Private Inbox.");
        msg.author.sendMessage("Your game has been initiated. You are now in `Towers of Hanoi` mode. Any private messages you send from here on out are considered to be part of your game session. To end the game session, simply type `end`.").then(message => {
            client.hanoi.set(msg.author.id, { left: new Tower(true), middle: new Tower(), right: new Tower(), steps: 0 });
            client.hanoi.get(msg.author.id)["collector"] = message.channel.createCollector(x => x.author.id === msg.author.id);
            handle(msg.author);
        });
    }
}

module.exports = hanoi;