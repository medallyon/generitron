const Discord = require("discord.js");

class Party extends Discord.Collection
{
    constructor(leader)
    {
        super();
        super.set(leader.id, leader);
        this.leader = leader;
        this.inviteQueue = [];
    }

    add(user)
    {
        if (this.size <= 4) super.set(user.id, user);
        return user;
    }

    remove(user)
    {
        if (super.has(user.id)) super.delete(user.id);
        if (user.id === this.leader.id) this.leader = super.random();
        return user;
    }

    showcase()
    {
        let e = new Discord.RichEmbed()
            .setColor(utils.randColor())
            .setAuthor(`${this.leader.username}'s Party`, this.leader.avatarURL)
            .setTitle("Members")
            .setTimestamp(new Date().toISOString())
            .setFooter("Brought to you by Grogsile, Inc.", "https://i.grogsile.me/favicon.png");

        for (let member of this.values()) {
            e.addField(member.username, "1CP", true);
        }

        return e;
    }
}

module.exports = Party;
