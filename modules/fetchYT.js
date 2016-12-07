const yt = require("ytdl-core");
const urlRegExp = new RegExp("(?:https?:\/\/)?(?:(?:(?:www\.?)?youtube\.com(?:\/(?:(?:watch\?.*?(v=[^&\s]+).*)|(?:v(\/.*))|(channel\/.+)|(?:user\/(.+))|(?:results\?(search_query=.+))))?)|(?:youtu\.be(\/.*)?))", "g");

var fetchYT = (msg) => {
    const voiceChannel = msg.member.voiceChannel;
    if (!voiceChannel) {
        return msg.reply("Please be in a voice channel first!");
    }
    if (!urlRegExp.test(msg.arguments[0])) {
        return msg.channel.sendMessage("A valid YouTube URL needs to be supplied with this command.");
    }
    voiceChannel.join()
        .then(connnection => {
            let stream = yt(msg.arguments[0], { audioonly: true });
            const dispatcher = connnection.playStream(stream);
            dispatcher.on("end", () => {
                voiceChannel.leave();
            });
        });
}

module.exports = fetchYT;