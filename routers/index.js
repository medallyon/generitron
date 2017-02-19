var express = require("express")
, fs = require("fs-extra")
, path = require("path");

const WWWROOT = path.join(__base, "wwwroot");

var router = express.Router();

router.get("/", function(req, res)
{
    // send the main HTML file to the user's browser
    res.sendFile(path.join(WWWROOT, "html", "index", "index.html"));
});

module.exports = router;