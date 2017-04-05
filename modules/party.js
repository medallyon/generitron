// import some important modules
const Discord = require("discord.js")
, Party = require("../structs/Party.js");

// create a middleware variable so I don't have to type client.parties every time
let parties = client.parties;

// function to check if user is in a party - returns party if true, null if false
function ofParty(user)
{
    for (let party of parties.values())
    {
        if (party.has(user.id)) return party;
    }
    return null;
}

// invites a user and returns that user object
function invite(user, party)
{
    user.sendMessage(`Hey There! ${party.leader} has invited you to join their party!\nType \`Accept\` to accept the invite, or \`Decline\` to decline the invite.`)
        .then(msg => {
            party.inviteQueue.push(user.id);

            let responseFilter = (x) => ((x.author.id === user.id) && (x.content.toLowerCase().includes("acc") || x.content.toLowerCase().includes("dec")));
            msg.channel.createCollector(responseFilter, { time: 60000, maxMatches: 1 })
                .on("end", (collected, reason) => {
                    party.inviteQueue.splice(party.inviteQueue.indexOf(user.id), 1);

                    if (reason === "time")
                    {
                        party.leader.sendEmbed(party.showcase(), `${user} has not responded to your Party Invitation.`);
                        user.sendMessage(`You took too long to respond to ${party.leader}'s Party Invitation.`);
                    } else

                    if (collected.first().content.toLowerCase().includes("acc"))
                    {
                        if (party.size === 4) return user.sendMessage(`${party.leader}'s party is full.`);
                        party.add(user);

                        party.leader.sendEmbed(party.showcase(), `${user} has accepted your Party Invitation!`);
                        user.sendEmbed(party.showcase(), `You have accepted ${party.leader}'s request to join their Party!`);
                    } else

                    if (collected.first().content.toLowerCase().includes("dec"))
                    {
                        party.leader.sendEmbed(party.showcase(), `${user} has declined your Party Invitation.`);
                        user.sendMessage(`You have declined ${party.leader}'s request to join their Party.`);
                    }

                    if (party.inviteQueue.length === 0 && party.size === 1) parties.delete(party.leader.id);
                });
        });
    return user;
}

// handles requests to join parties
function join(user, party)
{
    party.leader.sendMessage(`Hey There! ${user} has requested to join your Party!\nType \`Accept\` to accept the request, or \`Decline\` to decline the request.`)
        .then(msg => {
            let responseFilter = (x) => ((x.author.id === user.id) && (x.content.toLowerCase().includes("acc") || x.content.toLowerCase().includes("dec")));
            msg.channel.createCollector(responseFilter, { time: 120000, maxMatches: 1 })
                .on("end", (collected, reason) => {
                    if (reason === "time")
                    {
                        user.sendMessage(`${party.leader} has not responded to your Party Request.`);
                        party.leader.sendMessage(`You have declined ${user}'s Party Request.`);
                    } else

                    if (collected.first().content.toLowerCase().includes("acc"))
                    {
                        if (party.size === 4) return user.sendMessage(`${party.leader}'s party is full.`);
                        party.add(user);

                        user.sendEmbed(party.showcase(), `${party.leader} has accepted your Party Request!`);
                        party.leader.sendEmbed(party.showcase(), `You have accepted ${user}'s request to join your Party!`);
                    } else

                    if (collected.first().content.toLowerCase().includes("dec"))
                    {
                        party.leader.sendEmbed(party.showcase(), `You have declined ${user}'s request to join your Party.`);
                        user.sendMessage(`${party.leader} has declined your Party Request.`);
                    }
                });
        });
    return user;
}

// the main function
function party(msg)
{
    let thisParty;
    for (let p of parties.values()) {
        if (p.has(msg.author.id)) {
            thisParty = parties.get(msg.author.id);
            break;
        }
    }

    if (msg.args.length === 0)
    {
        if (thisParty) return msg.channel.sendEmbed(thisParty.showcase());
        return msg.channel.sendMessage("You're not part of a Party!");
    } else

    if (msg.args[0].toLowerCase() === "add" || msg.args[0].toLowerCase().startsWith("inv"))
    {
        if (parties.has(msg.author.id))
        {
            if (msg.mentions.users.size > 0)
            {
                if (msg.mentions.users.size === 1)
                {
                    let mentions = msg.mentions.users;
                    if (mentions.has(msg.author.id)) return msg.channel.sendMessage("You cannot invite yourself to a Party!");
                    if (mentions.first().bot) return msg.channel.sendMessage("You cannot invite bots to your Party!");
                    if (thisParty.has(mentions.first().id)) return msg.channel.sendMessage("This user is in your Party already!");
                    if (thisParty.inviteQueue.indexOf(mentions.first().id) > -1) return msg.channel.sendMessage("This person is busy.");
                }

                if (msg.mentions.users.size < 4 - thisParty.size)
                {
                    let toInvite = msg.mentions.users.filter(x => client.users.has(x.id)
                        && !x.bot
                        && x.id !== thisParty.leader.id
                        && !thisParty.has(x.id)
                        && thisParty.inviteQueue.indexOf(x.id) === -1)
                    , invited = [];
                    for (let user of toInvite.values())
                    {
                        invited.push(invite(user, thisParty).username);
                    }

                    if (invited.length === 0) return msg.channel.sendMessage("No mentioned users were eligible to be invited to this Party.");

                    return msg.channel.sendMessage(`You've invited **${(invited.length > 1) ? (invited.slice(0, invited.length-1).join("**, **") + "** and **" + invited[invited.length-1]) : (invited[0])}** to your Party!`);
                } else {
                    return msg.channel.sendMessage("The amount of users you mention needs to be less than the total size of your Party!");
                }
            } else {
                return msg.channel.sendMessage("You need to mention another user in order to form a Party!");
            }
        } else {
            for (let p of parties)
            {
                if (p.has(msg.author.id))
                {
                    return msg.channel.sendMessage("You're not the Party Leader!");
                }
            }
            
            // create a new party
            parties.set(msg.author.id, new Party(msg.author));
            return party(msg);
        }
    } else

    if (msg.args[0].toLowerCase() === "kick" || msg.args[0].toLowerCase().startsWith("rem"))
    {
        if (parties.has(msg.author.id))
        {
            if (msg.mentions.users.size > 0)
            {
                if (msg.mentions.users.size === 1 && msg.mentions.users.has(msg.author.id)) return msg.channel.sendMessage("You cannot kick yourself from this Party!");
                if (msg.mentions.users.size === 1 && !thisParty.has(msg.mentions.users.first().id)) return msg.channel.sendMessage("You cannot kick someone who is not in your Party!");

                let toRemove = msg.mentions.users.filter(x => client.users.has(x.id)
                    && x.id !== thisParty.leader.id
                    && thisParty.has(x.id))
                , removed = [];
                for (let member of toRemove.values())
                {
                    removed.push(thisParty.remove(member).username);
                }

                if (removed.length === 0) return msg.channel.sendMessage("No mentioned users were eligible to be kicked from this Party.");

                if (thisParty.size === 1) parties.delete(thisParty.leader.id);
                return msg.channel.sendMessage(`You've kicked **${(removed.length > 1) ? (removed.slice(0, removed.length-1).join("**, **") + "** and **" + removed[removed.length-1]) : (removed[0])}** from your Party! ${(!parties.has(thisParty.leader.id)) ? "Your Party has been disbanded." : ""}`);
            }
        } else {
            for (let p of parties.values())
            {
                if (p.has(msg.author.id))
                {
                    return msg.channel.sendMessage("You're not the Party Leader!");
                }
            }
            return msg.channel.sendMessage("You're not part of a Party!");
        }
    } else

    if (msg.args[0].toLowerCase() === "leave")
    {
        if (!thisParty) return msg.channel.sendMessage("You're not part of a Party!");
        thisParty.remove(msg.author);
        msg.channel.sendMessage(`You have left your current Party. ${(thisParty.size === 1) ? "The Party was disbanded." : "The Party's new leader is **" + thisParty.leader.username + "**!"}`);
    } else

    if (msg.args[0].toLowerCase() === "join")
    {
        if (msg.mentions.users.size > 1) return msg.channel.sendMessage("You cannot request to join more than one user's group.");
        // if author and mentioned user aren't in parties
        if (!thisParty && !ofParty(msg.mentions.first()))
        {
            msg.args[0] = "add";
            return party(msg);
        }

        let partyToJoin;
        if (parties.has(msg.mentions.first().id)) partyToJoin = parties.get(msg.mentions.users.first().id);
        if (partyToJoin)
        {
            if (partyToJoin.size === 4) return msg.channel.sendMessage(`**${partyToJoin.leader.toString()}**'s Party is full.`)
            return join(msg.author, partyToJoin);
        }
    } else

    if (msg.args[0].toLowerCase() === "disband")
    {
        if (thisParty && thisParty.leader.id === msg.author.id)
        {
            parties.delete(thisParty.leader.id);
            msg.channel.sendMessage("Your Party was disbanded.");
        }
    }
}

// this line makes this whole module accessible to other scripts that may want to import this module
module.exports = party;
