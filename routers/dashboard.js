const Discord = require("discord.js")
, express = require("express")
, passport = require("passport")
, Strategy = require("passport-discord").Strategy
, session = require("express-session")
, fs = require("fs-extra")
, join = require("path").join;

var router = express.Router()
, locals = {};

// ===== [ DISCORD AUTH ] ===== //

passport.serializeUser(function(user, done) {
    done(null, user);
});
passport.deserializeUser(function(obj, done) {
    done(null, obj);
});

passport.use(new Strategy({
    clientID: client.config.oauth.id,
    clientSecret: client.config.oauth.secret,
    callbackURL: client.config.oauth.callback,
    scope: ["identify", "guilds"]
}, function(accessToken, refreshToken, profile, done) {
    process.nextTick(function() {
        return done(null, profile);
    });
}));
router.use(session({
    secret: utils.genSecret(),
    resave: false,
    saveUninitialized: false
}));
router.use(passport.initialize());
router.use(passport.session());

router.get("/login", isLoggedIn, function(req, res)
{
    res.redirect("/dashboard");
});

router.get("/actuallylogin", passport.authenticate("discord", { scope: ["identify", "guilds"] }), (req, res) => {});

router.get("/callback", passport.authenticate("discord", { failureRedirect: "/" }), function(req, res)
{
    const userDir = join(__data, "users", req.user.id);

    fs.readdir(join(__data, "users"), (err, users) => {
        if (err) console.error(err);

        fs.outputJson(`${userDir}/user.json`, req.user, (err) => {
            if (err) console.error(err);

            res.redirect("/dashboard");
        });
    });
});

router.get("/logout", function(req, res) {
    req.logout();
    res.redirect("/");
});

// ===== [ HELPER FUNCTIONS ] ===== //

function isLoggedIn(req, res, next)
{
    if (req.isAuthenticated()) next();
    else res.redirect(`/actuallylogin`);
}

function resetLocals(req, res, next)
{
    locals = {
        location: "",
        content: "",
        styles: [],
        scripts: [],
        user: req.user || null
    };
    next();
}

// ===== [ HTTP ROUTES ] ===== //

router.get("/dashboard", isLoggedIn, function(req, res)
{
    locals.location = "guilds";

    locals.guilds = [];
    for (let guild of req.user.guilds) {
        if (guild.owner || utils.determinePermissions(client.guilds.get(guild.id).members.get(req.user.id)) >= 300)
        {
            locals.guilds.push(client.guilds.get(guild.id));
        }
    }

    res.render("pages/dashboard", locals);
});

router.get("/dashboard/:guild", isLoggedIn, function(req, res)
{
    fs.readdir(join(__data, "guilds"), (err, guilds) => {
        if (err) console.error(err);

        if (guilds.indexOf(req.params.guild) > -1) locals.guild = client.guilds.get(req.params.guild);
        else return res.render("pages/error", { title: "404", content: "Applesauce! This guild cannot be found in the intergalactic databank!" });

        res.render("pages/dashboard", locals);
    });
});

router.get("/dashboard/:guild/users", isLoggedIn, function(req, res)
{
    locals.location = "users";

    fs.readdir(join(__data, "guilds"), (err, guilds) => {
        if (err) console.error(err);

        if (guilds.indexOf(req.params.guild) > -1) locals.members = client.guilds.get(req.params.guild).members.array();
        else return res.render("pages/error", { title: "404", content: "Applesauce! This guild cannot be found in the intergalactic databank!" });

        locals.guild = client.guilds.get(req.params.guild);

        res.render("pages/dashboard", locals);
    });
});

module.exports = router;
