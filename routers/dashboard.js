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

// serialise the user object
passport.serializeUser(function(user, done) {
    done(null, user);
});
// de-serialise the user object
passport.deserializeUser(function(obj, done) {
    done(null, obj);
});

// make use of a 'Strategy'
passport.use(new Strategy({
    clientID: client.config.oauth.id,
    clientSecret: client.config.oauth.secret,
    callbackURL: client.config.oauth.callback,
    // the scope determines the permissions needed
    scope: ["identify", "guilds"]
}, function(accessToken, refreshToken, profile, done) {
    process.nextTick(function() {
        return done(null, profile);
    });
}));
// make use of user-sessions
router.use(session({
    secret: utils.genSecret(),
    resave: false,
    saveUninitialized: false
}));
// initialise the passport
router.use(passport.initialize());
// initialise the session
router.use(passport.session());

// when https://domain/login is accessed by the user
router.get("/login", isLoggedIn, function(req, res)
{
    // redirect them to the dashboard
    res.redirect("/dashboard");
});

// if the user is redirected to /actuallylogin, authenticate them
router.get("/actuallylogin", passport.authenticate("discord", { scope: ["identify", "guilds"] }), (req, res) => {});

// when the user has pressed 'Authorise', they are redirected to /callback
router.get("/callback", passport.authenticate("discord", { failureRedirect: "/" }), function(req, res)
{
    // declare the user's data directory
    const userDir = join(__data, "users", req.user.id);

    // output their updated info (username, avatar, guilds) to a file
    fs.outputJson(`${userDir}/user.json`, req.user, (err) => {
        if (err) console.error(err);

        // redirect them to the /dashboard once this process is done
        console.log("created " + userDir + "/user.json");
        res.redirect("/dashboard");
    });
});

// when the user wants to logout
router.get("/logout", function(req, res) {
    // log the user out
    req.logout();
    // redirect them to the homepage
    res.redirect("/");
});

// ===== [ HELPER FUNCTIONS ] ===== //

// middleware | carries on if user is logged in
// redirects the user to /actuallylogin if they are not
function isLoggedIn(req, res, next)
{
    if (req.isAuthenticated()) next();
    else res.redirect(`/actuallylogin`);
}

// middleware | this function is called every time a user accesses any /website
// this resets the local variables used to fill the content of static HTML pages
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

// when the user accesses /dashboard
router.get("/dashboard", resetLocals, isLoggedIn, function(req, res)
{
    locals.location = "guilds";

    // render the page 'dashboard.ejs' with the given locals
    res.render("pages/dashboard", locals);
});

// when the user accesses a guild on the dashboard
router.get("/dashboard/:guild", resetLocals, isLoggedIn, function(req, res)
{
    // read the directory for the guilds
    fs.readdir(join(__data, "guilds"), (err, guilds) => {
        if (err) console.error(err);

        // if the guild the user specified doesn't exist, show them an error
        if (guilds.indexOf(req.params.guild) === -1) return res.render("pages/error", Object.assign(locals, { location: "404", title: "404", content: "Applesauce! This guild cannot be found in the intergalactic databank!" }));
        
        // fill some locals
        locals.location = client.guilds.get(req.params.guild).name;
        locals.guild = client.guilds.get(req.params.guild);
        locals.members = locals.guild.members.array();

        // this is additional javascript for this specific /website
        locals.scripts.push("/i/dashboard/guild/js/guild.js");

        // render /dashboard with the locals
        res.render("pages/dashboard", locals);
    });
});

// when the user accesses a guild using the POST method
router.post("/dashboard/:guild", resetLocals, isLoggedIn, function(req, res)
{
    // set the guild variable
    let guild = client.guilds.get(req.params.guild);
    // if a user does not have permission to access this guild's configuration, give them a permission error
    if (utils.determinePermissions(guild.members.get(req.user.id)) < 300) return res.status(401).send("Insufficient Permission.");

    // check for a name change
    if (req.body.name)
    {
        // sets the guild's name to whatever the user specified on the dashboard
        guild.setName(req.body.name).then(() => { res.status(200).end() });
    }

    // check if anyone was kicked from the dashboard
    else if (req.body.membersToKick && req.body.rolesToRemove)
    {
        // initialise some variables
        let kicked = 0
        , removed = 0;

        // for every member in 'membersToKick'
        for (let memberId of req.body.membersToKick) {
            // increase the count for 'kicked'
            kicked++;
            // kick the specified member
            guild.members.get(memberId).kick();
        }

        // do the same for roles to remove from members
        for (let memberId in req.body.rolesToRemove) {
            removed++;
            guild.members.get(memberId).removeRoles(req.body.rolesToRemove[memberId]);
        }

        // when everything is done, send the HTTP code for 'OK' to the user
        if (kicked === req.body.membersToKick.length && removed === Object.keys(req.body.rolesToRemove).length) res.status(200).end();
    }

    // check if the RSS option is enabled
    else if (req.body.enabled)
    {
        // read the config for the guild in question
        utils.readConfig(guild)
            .then(config => {
                // set RSS as enabled and fill in the rest of the variables 
                config.rss.enabled = req.body.enabled;
                config.rss.feedURL = req.body.feedURL;
                config.rss.channel = req.body.channel;

                // output this data to the guild's config file
                fs.outputJson(join(__data, "guilds", guild.id, "config.json"), config);

                // reload the page to indicate that the deed has been done
                res.redirect(req.originalUrl);
            // catch any errors
            }).catch(console.error);
    }
});

// export the router so the application can use all of the above code
module.exports = router;
