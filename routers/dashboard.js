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

    fs.outputJson(`${userDir}/user.json`, req.user, (err) => {
        if (err) console.error(err);

        console.log("created " + userDir + "/user.json");
        res.redirect("/dashboard");
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
        user: req.user || null,
        guilds: []
    };
    if (req.user)
    {
        for (let guild of req.user.guilds) {
            if (guild.owner || (client.guilds.has(guild.id) && utils.determinePermissions(client.guilds.get(guild.id).members.get(req.user.id)) >= 300))
            {
                locals.guilds.push(client.guilds.get(guild.id));
            }
        }
    }
    next();
}

// ===== [ HTTP ROUTES ] ===== //

router.get("/dashboard", resetLocals, isLoggedIn, function(req, res)
{
    locals.location = "guilds";

    res.render("pages/dashboard", locals);
});

router.get("/dashboard/:guild", resetLocals, isLoggedIn, function(req, res)
{
    fs.readdir(join(__data, "guilds"), (err, guilds) => {
        if (err) console.error(err);

        if (guilds.indexOf(req.params.guild) === -1) return res.render("pages/error", Object.assign(locals, { location: "404", title: "404", content: "Applesauce! This guild cannot be found in the intergalactic databank!" }));
        
        locals.location = client.guilds.get(req.params.guild).name;
        locals.guild = client.guilds.get(req.params.guild);
        locals.members = locals.guild.members.array();

        locals.scripts.push("/i/dashboard/guild/js/guild.js");

        res.render("pages/dashboard", locals);
    });
});

router.post("/dashboard/:guild", resetLocals, isLoggedIn, function(req, res)
{
    let guild = client.guilds.get(req.params.guild);
    if (utils.determinePermissions(guild.members.get(req.user.id)) < 300) return res.status(401).send("Insufficient Permission.");

    console.log(req.body);
    if (req.body.name)
    {
        guild.setName(req.body.name).then(() => { res.status(200).end() });
    }

    else if (req.body.membersToKick && req.body.rolesToRemove)
    {
        let kicked = 0
        , removed = 0;

        for (let memberId of req.body.membersToKick) {
            kicked++;
            guild.members.get(memberId).kick();
        }

        for (let memberId in req.body.rolesToRemove) {
            removed++;
            guild.members.get(memberId).removeRoles(req.body.rolesToRemove[memberId]);
        }

        if (kicked === req.body.membersToKick.length && removed === Object.keys(req.body.rolesToRemove).length) res.status(200).end();
    }

    else if (req.body.enabled)
    {
        utils.readConfig(guild)
            .then(config => {
                config.rss.enabled = req.body.enabled;
                config.rss.feedURL = req.body.feedURL;
                config.rss.channel = req.body.channel;

                fs.outputJson(join(__data, "guilds", guild.id, "config.json"), config);

                res.redirect(req.originalUrl);
            }).catch(console.error);
    }
});

module.exports = router;
