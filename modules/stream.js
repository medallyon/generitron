var ytdl = require("ytdl-core")
, Discord = require("discord.js")
, YouTube = require("simple-youtube-api");
const simpleSearch = new YouTube(client.config.google.api.keys.youtube);

const videoRegExp = /^<?http(?:s?):\/\/(?:www\.)?youtu(?:be\.com\/watch\?v=|\.be\/)([\w\-\_]*)(&(amp;)?‌​[\w\?‌​=]*)?>?$/;
let connections = new Discord.Collection();

function process(guildId)
{
    let thisQueue = connections.get(guildId).queue;
    if (!thisQueue) return;
    if (thisQueue.length === 0) {
        connections.get(guildId).connection.disconnect();
        return connections.delete(guildId);
    }

    connections.get(guildId)["now"] = connections.get(guildId).queue.shift();
    play(connections.get(guildId).now);
}

function createCurrentTrackEmbed(track)
{
    return new Discord.RichEmbed()
        .setColor(utils.randColor())
        .setAuthor(track.title, track.requested.member.user.avatarURL, `https://youtu.be/${track.video_id}`)
        .setThumbnail(track.iurlmaxres)
        .setFooter("Brought to you by Grogsile Industries Inc.", client.user.avatarURL)
        .setTimestamp(new Date(track.timestamp))
        .addField("Views", utils.numberWithCommas(track.view_count), true)
        .addField("Length", `${Math.floor(track.length_seconds / 60)} Minutes ${track.length_seconds % 60} Seconds`, true)
        .addField("Reference", `https://youtu.be/${track.video_id}`, true);
}

function createQueueEmbed(guildId)
{
    let embed = new Discord.RichEmbed();

    let thisQueue = connections.get(guildId).queue;
    embed.setColor(utils.randColor())
    .setAuthor("Queue", thisQueue[0].requested.member.user.avatarURL)
    .setDescription(`The maximum amount of items in the queue is **25**. Type \`${client.config.prefix}play [YouTube URL]\` to add a song to the queue.`)
    .setFooter("Brought to you by Grogsile Industries Inc.", "https://i.grogsile.me/img/favicon.png")
    .setTimestamp(new Date());

    for (let i = 0; i < thisQueue.length; i++) {
        embed.addField(`${i+1}. ${thisQueue[i].title}`, `https://youtu.be/${thisQueue[i].video_id}\n${((Math.floor(thisQueue[i].length_seconds / 60) > 1) ? (Math.floor(thisQueue[i].length_seconds / 60) + " Minutes " + (thisQueue[i].length_seconds % 60) + " Seconds") : (thisQueue[i].length_seconds % 60) + " Seconds")}`, true);
    }

    return embed;
}

function play(track)
{
    connections.get(track.guildId).connection.playStream(ytdl.downloadFromInfo(track, { filter: "audioonly" }))
        .on("start", function() {
            console.log(`\nStarted playing '${track.title}' in [${track.requested.channel.guild.toString()}|#${track.requested.channel.name}]`);
            connections.get(track.guildId).now["streamDispatcher"] = this;
            track.requested.channel.sendEmbed(createCurrentTrackEmbed(track)).catch(console.error);
        })
        .on("error", function(err) {
            console.error(err);
            track.requested.channel.sendMessage(":x: Something went wrong :/");
        })
        .on("end", function(reason) {
            console.log(reason);
            if (connections.has(track.guildId) && connections.get(track.guildId).now.streamDispatcher) delete connections.get(track.guildId).now.streamDispatcher;
            process(track.guildId);
        });
}

function stop(guildId)
{
    connections.get(guildId).connection.disconnect();
    return connections.delete(guildId);
}

function skip(guildId)
{
    connections.get(guildId).now.streamDispatcher.end();
}

function searchVideos(query)
{
    return new Promise(function(resolve, reject) {
        simpleSearch.searchVideos(query)
            .then(videos => {
                resolve(videos[0].id);
            })
            .catch(err => {
                reject(err);
            });
    });
}

function fetchVideoInfo(id)
{
    return new Promise(function(resolve, reject) {
        ytdl.getInfo(id, (err, info) => {
            if (err) reject(err);
            resolve(info);
        });
    });
}

function stream(msg)
{
    if (!msg.guild) return msg.channel.sendMessage("This is a server-exclusive command. Please try again on a server.");

    if (msg.command.toLowerCase() === "queue") {
        if (connections.has(msg.guild.id) && connections.get(msg.guild.id).queue.length > 0) {
            msg.channel.sendEmbed(createQueueEmbed(msg.guild.id)).catch(console.error);
        } else {
            msg.channel.sendMessage(`This queue is empty! Add a song like this:\`\`\`fix\n${client.config.prefix}play [YouTube URL]\`\`\``);
        }
    } else

    if (msg.command.toLowerCase() === "stop") {
        if (connections.has(msg.guild.id) && connections.get(msg.guild.id).connection)
            stop(msg.guild.id);
    } else

    if (msg.command.toLowerCase() === "skip") {
        if (connections.has(msg.guild.id) && connections.get(msg.guild.id).connection) {
            if (connections.get(msg.guild.id).queue.length > 0)
                skip(msg.guild.id);
            else
                stop(msg.guild.id);
        }
    } else

    if (msg.command.toLowerCase() === "now") {
        if (connections.has(msg.guild.id)) {
            let thisTrack = connections.get(msg.guild.id).now;
            msg.channel.sendEmbed(createCurrentTrackEmbed(thisTrack));
        }
    } else

    if (msg.args.length > 0) {

        if (!msg.member.voiceChannel) return msg.channel.sendMessage("You need to be present in a **Voice Channel** before executing this command.");

        // direct url
        if (msg.args[0].indexOf("v=") > -1) {
            msg.args[0] = msg.args[0].replace(/[\<\>]/g, "");
            let videoId = msg.args[0].slice(msg.args[0].indexOf("v=")+2, (msg.args[0].slice(msg.args[0].indexOf("v="), msg.args[0].length).indexOf("&") > -1) ? msg.args[0].slice(msg.args[0].indexOf("v="), msg.args[0].length).indexOf("&") : msg.args[0].length);

            console.log(videoId);

            if (connections.has(msg.guild.id) && connections.get(msg.guild.id).queue.length === 25) return msg.channel.sendMessage("Nuh-Uh! You may not add more than 25 tracks in the same queue. Wait and try again!");

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
                .catch(console.error);
        }

        else {
            searchVideos(msg.args.join(" "))
                .then(videoId => {
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
                .catch(err => {
                    msg.channel.sendMessage(err).catch(console.error);
                });
        }
    }

    /*if (msg.command.toLowerCase() === "loop" || msg.args[0].toLowerCase() === "loop") {

    } else*/

    else {
        msg.args = ["play"];
        return modules.help(msg);
    }
}

module.exports = stream;