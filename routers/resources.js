const path = require("path")
, express = require("express");

var router = express.Router();

router.get("/i/*.(css|js)", function(req, res)
{
    res.sendFile(path.join(__base, "wwwroot", "resources", req.originalUrl).replace("\\i", ""));
});

module.exports = router;