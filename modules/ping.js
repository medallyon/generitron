function ping(msg)
{
    let text = "Pong!";
    if (msg.args.length > 0) {
        text = msg.args.join(" ");
    }
    msg.channel.sendMessage(text);
}

module.exports = ping;