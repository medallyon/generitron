// "ready" event, taking no parameter
client.once("ready", function () {
    // log a formatted string to the console to signify that the script is ready
    console.log(`${client.user.username.toUpperCase()} is ready to serve ${client.guilds.size} guild${client.guilds.size == 1 ? "" : "s"}, accumulating ${client.users.size} user${client.users.size == 1 ? "" : "s"}.`);
});