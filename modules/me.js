var me = (msg) => {
    let author = msg.author;
    let reformattedAuthor = {};
    
    if (author.presence.game) {
        reformattedAuthor["presence"] = {
            title: "You're Playing",
            desc: author.presence.game
        };
    } else {
        reformattedAuthor["presence"] = {
            title: "Status",
            desc: author.presence.status
        };
    }

    msg.channel.sendMessage("", {
        embed: {
            color: 8395109,
            author: {
                name: author.username,
                icon_url: author.avatarURL
            },
            fields: [
                {
                    name: "ID",
                    value: author.id,
                    inline: true
                },
                {
                    name: "Discriminator",
                    value: author.discriminator,
                    inline: true
                },
                {
                    name: "Created",
                    value: author.createdAt,
                    inline: true
                },
                {
                    name: reformattedAuthor.presence.title,
                    value: reformattedAuthor.presence.desc,
                    inline: true
                },
                {
                    name: "BOT Account",
                    value: author.bot,
                    inline: true
                }
            ],
            image: {
                url: "https://i.grogsile.me/img/esoi/me/newChar.png"
            },
            timestamp: new Date(),
            footer: {
                icon_url: client.user.avatarURL,
                text: "© Grogsile Inc. | https://github.com/Medallyon/exambot"
            }
        }
    });
}

module.exports = me;