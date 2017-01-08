var wiki = require("node-wikipedia");

function fetchWiki(msg)
{
    if (msg.args.length === 0)
        return msg.channel.sendMessage(`At least one parameter must be passed with that command. Try this:\`\`\`fix\n@${client.user.username} wiki Batman\`\`\``);

    let query = msg.args.join(" ");

    wiki.page.data(query.replace(/ /g, "_"), { content: true }, (res) => {

        console.log(res);

        let bDisambiguation = false;
        for (let category in res.categories) {
            if (res.categories[category]["*"] === "Disambiguation_pages") {
                bDisambiguation = true;
                let disambiguations = [];

                for (let i = 0; i < res.links.length; i++) {
                    disambiguations.push(`${i}. ${res.links[i]["*"]}`);
                }

                msg.channel.sendMessage(`There are some disambiguations for your query. Choose one:\`\`\`fix\n${disambiguations.join("\n")}\`\`\``)
                    .then(() => {
                        let disambiguationRegex = new RegExp(`\d${String(disambiguations).length}`);
                        let messageFilter = x => {
                            return (x.author.id === msg.author.id && /\d{1,2}/.test(x.content));
                        };
                        msg.channel.awaitMessages(messageFilter, { time: 30000, maxMatches: 1 })
                            .then(collected => {
                                msg.channel.sendMessage(wiki.page.data(disambiguations[collected.first() - 1]));
                            }).catch(err => {
                                msg.channel.sendMessage(`${msg.author} You took too long.`);
                            });
                    });
            }
        }
    });
}

module.exports = fetchWiki;