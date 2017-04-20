// the evaluate function
function evaluate(msg)
{
    // use the try keyword
    try {
        // set a new variable to the evaluated string
        let evaluated = eval(msg.args.join(" "));
        // send this string to the channel of origin
        msg.channel.sendMessage("```js\n" + evaluated + "```").catch(console.error);
    // catch any errors during execution
    } catch (err) {
        // tell the user that an error has occurred
        msg.channel.sendMessage("```js\n" + err + "```").catch(console.error);
    }
}

// export the module
module.exports = evaluate;
