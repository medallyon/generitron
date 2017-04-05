const ytdl = require("ytdl-core")
, Discord = require("discord.js")
, YouTube = require("simple-youtube-api");

// create a new instance of the YouTube SimpleSearch class,
// which enables me search for specific youtube videos
const simpleSearch = new YouTube(client.config.google.api.keys.youtube);

// this Regular Expression is used to check whether the user's input is a valid YouTube URL
const videoRegExp = /^<?http(?:s?):\/\/(?:www\.)?youtu(?:be\.com\/watch\?v=|\.be\/)([\w\-\_]*)(&(amp;)?‌​[\w\?‌​=]*)?>?$/;
// initiate a new Discord.js Collection that will hold all the active Voice Connections
let connections = new Discord.Collection();

// this function 'processes' the next request in the queue
// if there is nothing to process, then the queue is deleted
// and the Voice Connection is destroyed
function process(guildId)
{
    // create an intermediate 'thisQueue' variable for convenience
    let thisQueue = connections.get(guildId).queue;
    // if there is no queue for this guild, return
    if (!thisQueue) return;
    // if there are no tracks in the queue for this guild
    if (thisQueue.length === 0) {
        // disconnect
        connections.get(guildId).connection.disconnect();
        // and delete this guild's queue
        return connections.delete(guildId);
    }

    // otherwise, shift the queue's items by one and set that as the 'now playing' variable
    connections.get(guildId)["now"] = connections.get(guildId).queue.shift();
    // and start playing this track
    play(connections.get(guildId).now);
}

// returns a Discord Rich Embed with the current track information
function createCurrentTrackEmbed(track)
{
    // create and return a Discord.js Rich Embed
    return new Discord.RichEmbed()
        // set the embed's color to any random color
        .setColor(utils.randColor())
        // set the author to the current track's title, the icon to the user's icon who requested the track, and the URL to the video on YouTube
        .setAuthor(track.title, track.requested.member.user.avatarURL, `https://youtu.be/${track.video_id}`)
        // set the thumbnail to the track's thumbnail, if there is one
        .setThumbnail(track.iurlmaxres)
        // sets the footer to the appropriate 'brought to you by' message
        .setFooter("Brought to you by Grogsile Industries Inc.", client.user.avatarURL)
        // add an appropriate ISO timestamp
        .setTimestamp(new Date(track.timestamp).toISOString())
        // add a field for the view count of the video on YouTube
        .addField("Views", utils.numberWithCommas(track.view_count), true)
        // add a field for the length of the video
        .addField("Length", `${Math.floor(track.length_seconds / 60)} Minutes ${track.length_seconds % 60} Seconds`, true)
        // add a field for the URL on YouTube
        .addField("Reference", `https://youtu.be/${track.video_id}`, true);
}

// shows the user the current queue of tracks
function createQueueEmbed(guildId)
{
    // create a new Discord.js Rich Embed
    let embed = new Discord.RichEmbed();

    // create an intermediate variable for convenience
    let thisQueue = connections.get(guildId).queue;

    // set the color to any random color
    embed.setColor(utils.randColor())
    // set the author to 'Queue' and the icon to the user's icon who requested the first track in the queue
    .setAuthor("Queue", thisQueue[0].requested.member.user.avatarURL)
    // set a description
    .setDescription(`The maximum amount of items in the queue is **25**. Type \`${client.config.prefix}play [YouTube URL]\` to add a song to the queue.`)
    // set the appropriate footer
    .setFooter("Brought to you by Grogsile Industries Inc.", "https://i.grogsile.me/img/favicon.png")
    .setTimestamp(new Date().toISOString());

    // Iteration - add fields for all the tracks in the queue
    for (let i = 0; i < thisQueue.length; i++) {
        embed.addField(`${i+1}. ${thisQueue[i].title}`, `https://youtu.be/${thisQueue[i].video_id}\n${((Math.floor(thisQueue[i].length_seconds / 60) > 1) ? (Math.floor(thisQueue[i].length_seconds / 60) + " Minutes " + (thisQueue[i].length_seconds % 60) + " Seconds") : (thisQueue[i].length_seconds % 60) + " Seconds")}`, true);
    }

    // return the embed
    return embed;
}

// plays a given track
function play(track)
{
    // get the active Voice Connection for the current guild and play a stream returned from the 'ytdl-core' library for Node.js
    connections.get(track.guildId).connection.playStream(ytdl.downloadFromInfo(track, { filter: "audioonly" }))
        // on the 'start' event (when the track starts playing)
        .on("start", function() {
            // output to the console
            console.log(`\nStarted playing '${track.title}' in [${track.requested.channel.guild.toString()}|#${track.requested.channel.name}]`);
            // set a variable for the current track's streamDispatcher
            connections.get(track.guildId).now["streamDispatcher"] = this;
            // send a RichEmbed for the current track to the user who requested the track
            track.requested.channel.sendEmbed(createCurrentTrackEmbed(track)).catch(console.error);
        })
        // on the 'error' event
        .on("error", function(err) {
            // output the error to the console
            console.error(err);
            // tell the user that something went wrong
            track.requested.channel.sendMessage(":x: Something went wrong :/");
        })
        // on the 'end' event (when the track has ended)
        .on("end", function(reason) {
            // output the reason for ending to the console
            console.log(reason);
            // if the variable for this track's streamDispatcher still exists, delete it
            if (connections.has(track.guildId) && connections.get(track.guildId).now.streamDispatcher) delete connections.get(track.guildId).now.streamDispatcher;
            // call the function to 'process' the queue further
            process(track.guildId);
        });
}

// stops the current track and disconnects from voice
function stop(guildId)
{
    // disconnects the active Voice Connection from the guild
    connections.get(guildId).connection.disconnect();
    // delete and return this connection
    return connections.delete(guildId);
}

// skips the current track and moves on to the next, if there is a next
function skip(guildId)
{
    // simply call the 'end' method for this streamDispatcher
    connections.get(guildId).now.streamDispatcher.end();
}

// searches YouTube for a given input
function searchVideos(query)
{
    return new Promise(function(resolve, reject) {
        // search for the user's input on YouTube
        simpleSearch.searchVideos(query)
            .then(videos => {
                // then 'resolve' with the video's ID
                resolve(videos[0].id);
            })
            .catch(err => {
                // if there's an error, 'reject' with that error
                reject(err);
            });
    });
}

// fetches a specific video's info, such as description, title, creator
function fetchVideoInfo(id)
{
    return new Promise(function(resolve, reject) {
        // get a video's info from its ID
        ytdl.getInfo(id, (err, info) => {
            // if there's an error, reject with that error
            if (err) return reject(err);
            // otherwise, resolve with the returned info object
            resolve(info);
        });
    });
}

// the main function - controls the flow of the module
function stream(msg)
{
    // returns if a command is not executed inside a guild
    if (!msg.guild) return msg.channel.sendMessage("This is a server-exclusive command. Please try again on a server.");

    // if the command is 'queue'
    if (msg.command.toLowerCase() === "queue") {
        // if the bot is inside a Voice Channel AND this guild's queue isn't empty
        if (connections.has(msg.guild.id) && connections.get(msg.guild.id).queue.length > 0) {
            // send the the queue for the current guild
            msg.channel.sendEmbed(createQueueEmbed(msg.guild.id)).catch(console.error);
        } else {
            // otherwise, tell them that they need to add some tracks to the queue first
            msg.channel.sendMessage(`This queue is empty! Add a song like this:\`\`\`fix\n${client.config.prefix}play [YouTube URL]\`\`\``);
        }
    } else

    // if the command is 'stop'
    if (msg.command.toLowerCase() === "stop") {
        // check if the bot has an active Voice Connection in that guild, then call the 'stop' method
        if (connections.has(msg.guild.id) && connections.get(msg.guild.id).connection) stop(msg.guild.id);
    } else

    // if the command is 'skip'
    if (msg.command.toLowerCase() === "skip") {
        // check if the bot has an active Voice Connection in that guild
        if (connections.has(msg.guild.id) && connections.get(msg.guild.id).connection) {
            // check if the guilds has an active queue, then skip or stop
            if (connections.get(msg.guild.id).queue.length > 0) skip(msg.guild.id);
            else stop(msg.guild.id);
        }
    } else

    // if the command is 'now'
    if (msg.command.toLowerCase() === "now") {
        // check if the bot has an active Voice Connection in that guild
        if (connections.has(msg.guild.id)) {
            // create a new variable containing the track being played currently
            let thisTrack = connections.get(msg.guild.id).now;
            // send the user a response telling them the current track
            msg.channel.sendEmbed(createCurrentTrackEmbed(thisTrack));
        }
    } else

    // if there is no direct command
    if (msg.args.length > 0) {

        // return an error if the user is not inside a Voice Channel
        if (!msg.member.voiceChannel) return msg.channel.sendMessage("You need to be present in a **Voice Channel** before executing this command.");

        // if the arguments contain a direct YouTube URL
        if (msg.args[0].indexOf("v=") > -1) {
            // replace some potential brackets that could mess up the query ('<' and '>')
            msg.args[0] = msg.args[0].replace(/[\<\>]/g, "");
            // get the YouTube Video ID of the video the user has submitted
            let videoId = msg.args[0].slice(msg.args[0].indexOf("v=")+2, (msg.args[0].slice(msg.args[0].indexOf("v="), msg.args[0].length).indexOf("&") > -1) ? msg.args[0].slice(msg.args[0].indexOf("v="), msg.args[0].length).indexOf("&") : msg.args[0].length);

            // if the queue for the current guild already contains 25 tracks, return an error
            if (connections.has(msg.guild.id) && connections.get(msg.guild.id).queue.length === 25) return msg.channel.sendMessage("Nuh-Uh! You may not add more than 25 tracks in the same queue. Wait and try again!");

            // carry out the 'fetchVideoInfo' function with the video ID, which returns a JavaScript Promise
            fetchVideoInfo(videoId)
                .then(info => {
                    // if the current guild doesn't have a queue yet, create one
                    if (!connections.has(msg.guild.id)) connections.set(msg.guild.id, { queue: [] });

                    // establish some fundamental variables inside the 'info' object,
                    // which holds the requested video's info
                    info["guildId"] = msg.guild.id;
                    info["requested"] = {
                        member: msg.member,
                        channel: msg.channel
                    };

                    // push the requested video's info to the guild's queue
                    connections.get(msg.guild.id).queue.push(info);
                    // check if the bot is already playing a track
                    if (connections.get(msg.guild.id).hasOwnProperty("connection")) {
                        // add the track to the queue
                        msg.channel.sendMessage(`Your track **${info.title}** has been added to the queue.`).catch(console.error);
                    }
                    else {
                        // otherwise join the user's Voice Channel
                        msg.member.voiceChannel.join().then(vc => {
                            // then set an intermediate variable for the current Voice Connection
                            connections.get(msg.guild.id)["connection"] = vc;
                            // call the 'process' method for the current guild
                            process(msg.guild.id);
                        });
                    }
                // also catch any errors and output them to the console
                }).catch(console.error);
        }

        // if the arguments don't contain a direct command
        else {
            // search for the user's input on YouTube in hopes that it will find a video that is correct for the user
            searchVideos(msg.args.join(" "))
                // then
                .then(videoId => {
                    // execute the same steps that are carried out if there was a URL (previous code-block)
                    fetchVideoInfo(videoId)
                        .then(info => {
                            if (!connections.has(msg.guild.id)) connections.set(msg.guild.id, { queue: [] });

                            info["guildId"] = msg.guild.id;
                            info["requested"] = {
                                member: msg.member,
                                channel: msg.channel
                            };

                            connections.get(msg.guild.id).queue.push(info);
                            if (connections.get(msg.guild.id).hasOwnProperty("connection")) {
                                msg.channel.sendMessage(`Your track **${info.title}** has been added to the queue.`).catch(console.error);
                            }
                            else {
                                msg.member.voiceChannel.join().then(vc => {
                                    connections.get(msg.guild.id)["connection"] = vc;
                                    process(msg.guild.id);
                                });
                            }
                        })
                        .catch(err => {
                            console.error(err);
                        });
                })
                // if no video could be found for the user's input
                .catch(err => {
                    // tell the user
                    msg.channel.sendMessage(err).catch(console.error);
                });
        }
    }

    // if the bot doesn't understand the user's input
    else {
        // execute the 'help' module for this command in hopes that they will execute this command properly the next time around
        msg.args = ["play"];
        return modules.help(msg);
    }
}

// export this module
module.exports = stream;
