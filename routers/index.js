var express = require("express")
, fs = require("fs-extra")
, path = require("path");

var router = express.Router();

router.get("/", function(req, res)
{
    // send the main HTML file to the user's browser
    res.sendFile(path.join(__base, "wwwroot", "html", "index", "index.html"));
});

router.post("/", function(req, res)
{
    let author = client.guilds.get("236925155442425866").members.find("name", "@Medallyon");
    if (!author) {
        author = {
            user: {
                username: req.body.username,
                avatarURL: "https://placeholdit.imgix.net/~text?txtsize=24&txt=64&w=64&h=64"
            }
        }
    }

    let color;
    switch (req.body.color) {
        case "black":
            color = 0x000;
            break;

        case "white":
            color = 0xfff;
            break;

        case "red":
            color = 0xCC001C;
            break;

        case "green":
            color = 0x01B543;
            break;

        case "blue":
            color = 0x4303C4;
            break;
    }

    client.channels.get("236954015907184642").sendMessage("", {
        embed: {
            color: color,
            author: {
                name: author.user.username,
                icon_url: author.user.avatarURL
            },
            title: req.body.title,
            description: req.body.description + "\n",
            timestamp: new Date(),
            footer: {
                text: "© Grogsile Inc.",
                icon_url: client.user.avatarURL
            }
        }
    }).then(message => {
        res.redirect("/");
    }).catch(console.error);
});

module.exports = router;