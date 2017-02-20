var express = require("express")
, fs = require("fs-extra")
, path = require("path");

const WWWROOT = path.join(__base, "wwwroot");

var router = express.Router();

router.get("/*", function(req, res)
{
    // send the main HTML file to the user's browser if they've accessed "/"
    if (req.originalUrl === "\/") return res.sendFile(path.join(WWWROOT, "html", "index", "index.html"));

    // check if the file that the user requested exists
    fs.access(path.join(WWWROOT, "html", req.originalUrl, "index.html"), fs.constants.F_OK, (err) => {
        // if the file doesn't exist, send a typical "404" error message
        if (err) return res.status(404).send("You've ended up somewhere you weren't supposed to!");
        // otherwise send the file to the user's browser
        res.sendFile(path.join(WWWROOT, "html", req.originalUrl, "index.html"));
    });
});

module.exports = router;