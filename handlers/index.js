var fs = require("fs-extra")
, join = require("path").join;

fs.readdir(__dirname, (err, handlers) => {
    if (err) console.error(err);
    for (let handler of handlers) {
        require(join(__dirname, handler));
    }
});