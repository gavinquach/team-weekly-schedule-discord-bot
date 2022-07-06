// Initialize Discord Bot
require("dotenv").config();
const { Client, Intents } = require('discord.js');
const bot = new Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
        Intents.FLAGS.GUILD_PRESENCES,
        Intents.FLAGS.GUILD_MEMBERS
    ],
    partials: ['USER', 'REACTION', 'MESSAGE', 'CHANNEL']
});
bot.login(process.env.DISCORDJS_BOT_TOKEN);

const serverID = "922521154583941230";
const testChannelID = "994194410705276988";
const reactChannelID = "994194464618856468";
const teamRoleID = "922524439621566554";

const { CronJob } = require("cron");

// reset weekly schedule at 00:00 every Monday
const resetSchedule = new CronJob("0 0 * * 1", () => {
    resetScheduleMessage();
});
resetSchedule.start();

// import MessageEmbed module for embedding message
const { MessageEmbed } = require('discord.js');

let reactMessage = null;

const playerList = [];

const reactSlots = new Map();
reactSlots.set('1️⃣', "Monday");
reactSlots.set('2️⃣', "Tuesday");
reactSlots.set('3️⃣', "Wednesday");
reactSlots.set('4️⃣', "Thursday");
reactSlots.set('5️⃣', "Friday");
reactSlots.set('6️⃣', "Saturday");
reactSlots.set('7️⃣', "Sunday");

const playerLists = new Map();
playerLists.set('1️⃣', []);
playerLists.set('2️⃣', []);
playerLists.set('3️⃣', []);
playerLists.set('4️⃣', []);
playerLists.set('5️⃣', []);
playerLists.set('7️⃣', []);

resetAllVars = () => {
    playerList = [];
    playerLists.set('1️⃣', []);
    playerLists.set('2️⃣', []);
    playerLists.set('3️⃣', []);
    playerLists.set('4️⃣', []);
    playerLists.set('5️⃣', []);
    playerLists.set('6️⃣', []);
    playerLists.set('7️⃣', []);
}

postSchedule = async () => {
    const testChannel = bot.channels.cache.find(channel => channel.id === testChannelID);
    const channel = bot.channels.cache.find(channel => channel.id === reactChannelID);

    let embedMessage = null;
    try {
        list = "";
        playerList.forEach(player => list += '<@' + player + '>\n');

        list1 = ""; playerLists.forEach((player, day) => { if (day == '1️⃣') if (player != null) list1 += '<@' + player + '>, ' });
        list2 = ""; playerLists.forEach((player, day) => { if (day == '2️⃣') if (player != null) list2 += '<@' + player + '>, ' });
        list3 = ""; playerLists.forEach((player, day) => { if (day == '3️⃣') if (player != null) list3 += '<@' + player + '>, ' });
        list4 = ""; playerLists.forEach((player, day) => { if (day == '4️⃣') if (player != null) list4 += '<@' + player + '>, ' });
        list5 = ""; playerLists.forEach((player, day) => { if (day == '5️⃣') if (player != null) list5 += '<@' + player + '>, ' });
        list6 = ""; playerLists.forEach((player, day) => { if (day == '6️⃣') if (player != null) list6 += '<@' + player + '>, ' });
        list7 = ""; playerLists.forEach((player, day) => { if (day == '7️⃣') if (player != null) list7 += '<@' + player + '>, ' });

        if (list1.trim() == '<@>,' || list1.trim() == '')
            list1 = 'None';
        if (list2.trim() == '<@>,' || list2.trim() == '')
            list2 = 'None';
        if (list3.trim() == '<@>,' || list3.trim() == '')
            list3 = 'None';
        if (list4.trim() == '<@>,' || list4.trim() == '')
            list4 = 'None';
        if (list5.trim() == '<@>,' || list5.trim() == '')
            list5 = 'None';
        if (list6.trim() == '<@>,' || list6.trim() == '')
            list6 = 'None';
        if (list7.trim() == '<@>,' || list7.trim() == '')
            list7 = 'None';

        embedMessage = new MessageEmbed()
            .setColor('#00FFF2')
            .setTitle('React to set your weekly availability')
            .setDescription("```Monday = 1, Tuesday = 2, Wednesday = 3, Thursday = 4\nFriday = 5, Saturday = 6, Sunday = 7\n```")
            .addFields(
                { name: 'Monday', value: list1, inline: true },
                { name: 'Tuesday', value: list2, inline: true },
                { name: 'Wednesday', value: list3, inline: true },
                { name: 'Thursday', value: list4, inline: true },
                { name: 'Friday', value: list5, inline: true },
                { name: 'Saturday', value: list6, inline: true },
                { name: 'Sunday', value: list7, inline: true },
                { name: '\u200B', value: '\u200B' },
                { name: 'N/A list', value: list },
            )
            .setTimestamp()
        // .setFooter('')

    } catch (e) {
        await testChannel.send(`Error encountered when creating react message in ${channel.name}: ${e}`);
    }

    try {
        await channel.messages.fetch({ limit: 5 })
            .then(messages => {
                messages.forEach(message => {
                    message.delete();
                });
            });
    } catch (e) {
        await testChannel.send(`Error encountered while deleting react message in channel ${channel.name}: ${e}`);
    }

    let message = null;
    try {
        message = await channel.send({ embeds: [embedMessage] });

        // add reactions
        reactSlots.forEach((v, k) => {
            message.react(k);
        });
        reactMessage = message;
    } catch (e) {
        await testChannel.send(`Error encountered when posting react message in ${channel.name}: ${e}`);
    }
}

checkReactions = async () => {
    try {
        list = "";
        playerList.forEach(player => list += '<@' + player + '>\n');

        list1 = ""; playerLists.forEach((player, day) => { if (day == '1️⃣') if (player != null) console.log(player); list1 += '<@' + player + '>, ' });
        list2 = ""; playerLists.forEach((player, day) => { if (day == '2️⃣') if (player != null) list2 += '<@' + player + '>, ' });
        list3 = ""; playerLists.forEach((player, day) => { if (day == '3️⃣') if (player != null) list3 += '<@' + player + '>, ' });
        list4 = ""; playerLists.forEach((player, day) => { if (day == '4️⃣') if (player != null) list4 += '<@' + player + '>, ' });
        list5 = ""; playerLists.forEach((player, day) => { if (day == '5️⃣') if (player != null) list5 += '<@' + player + '>, ' });
        list6 = ""; playerLists.forEach((player, day) => { if (day == '6️⃣') if (player != null) list6 += '<@' + player + '>, ' });
        list7 = ""; playerLists.forEach((player, day) => { if (day == '7️⃣') if (player != null) list7 += '<@' + player + '>, ' });

        if (list1.trim() == '<@>,' || list1.trim() == '')
            list1 = 'None';
        if (list2.trim() == '<@>,' || list2.trim() == '')
            list2 = 'None';
        if (list3.trim() == '<@>,' || list3.trim() == '')
            list3 = 'None';
        if (list4.trim() == '<@>,' || list4.trim() == '')
            list4 = 'None';
        if (list5.trim() == '<@>,' || list5.trim() == '')
            list5 = 'None';
        if (list6.trim() == '<@>,' || list6.trim() == '')
            list6 = 'None';
        if (list7.trim() == '<@>,' || list7.trim() == '')
            list7 = 'None';

        embedMessage = new MessageEmbed()
            .setColor('#00FFF2')
            .setTitle('React to set your weekly availability')
            .setDescription("```Monday = 1, Tuesday = 2, Wednesday = 3, Thursday = 4\nFriday = 5, Saturday = 6, Sunday = 7\n```")
            .addFields(
                { name: 'Monday', value: list1, inline: true },
                { name: 'Tuesday', value: list2, inline: true },
                { name: 'Wednesday', value: list3, inline: true },
                { name: 'Thursday', value: list4, inline: true },
                { name: 'Friday', value: list5, inline: true },
                { name: 'Saturday', value: list6, inline: true },
                { name: 'Sunday', value: list7, inline: true },
                { name: '\u200B', value: '\u200B' },
                { name: 'N/A list', value: list },
            )
            .setTimestamp()
        // .setFooter('')
        await reactMessage.edit({ embeds: [embedMessage] });
    } catch (e) {
        const testChannel = bot.channels.cache.find(channel => channel.id === testChannelID);
        await testChannel.send("Error encountered when editing react message: " + e);
    }
}

bot.on('ready', async () => {
    console.log("Connected.");
    console.log("Logged in as " + bot.user.username + " (" + bot.user.id + ").");

    // get message sent by bot in the react channel
    const channel = bot.channels.cache.find(channel => channel.id === reactChannelID);
    await channel.messages.fetch({ limit: 1 }).then(messages => {
        messages.forEach(message => {
            reactMessage = message;
        });
    });

    if (!reactMessage) {
        console.log("Can't find react message!");
        // const testChannel = bot.channels.cache.find(channel => channel.id === testChannelID);
        // testChannel.send("Can't find react message!");
    }

    // Get player list
    let members = null;
    try {
        const guild = await bot.guilds.fetch(serverID);
        members = await guild.members.fetch();
    } catch (e) {
        const testChannel = bot.channels.cache.find(channel => channel.id === testChannelID);
        await testChannel.send(`Error encountered when getting player list in ${channel.name}: ${e}`);
    }

    members.forEach(member => {
        member._roles.forEach(roleid => {
            if (roleid == teamRoleID) {
                playerList.push(member.user);
            }
        });
    });

    // print player list for debug
    // playerList.forEach(player => console.log(player.username));
});

bot.on('messageReactionAdd', async (reaction, user) => {
    // only do stuff when it's reaction from react channel
    let reactedMessage = await reaction.message.fetch();
    if (reactedMessage.channelId != reactChannelID)
        return;

    if (reaction.message != reactMessage)
        return;

    // When a reaction is received, check if the structure is partial
    if (reaction.partial) {
        // If the message this reaction belongs to was removed, the fetching might result in an API error which should be handled
        try {
            await reaction.fetch();
        } catch (error) {
            console.error('Error encountered trying to fetch message: ', error);
            // Return as `reaction.message.author` may be undefined/null
            return;
        }
    }

    // check if the reaction is from the message's author
    const author = reaction.message.author;
    if (author === user)
        return;

    playerList.splice(playerList.indexOf(user), 1);
    if (playerList.includes(user))
        playerLists.set(reaction.emoji, user);
    checkReactions();
});

bot.on('messageReactionRemove', async (reaction, user) => {
    // only do stuff when it's reaction from react channel
    let reactedMessage = await reaction.message.fetch();
    // console.log(reactedMessage.channelId);
    if (reactedMessage.channelId != reactChannelID) {
        return;
    }

    if (reaction.message != reactMessage)
        return;

    // When a reaction is received, check if the structure is partial
    if (reaction.partial) {
        // If the message this reaction belongs to was removed, the fetching might result in an API error which should be handled
        try {
            await reaction.fetch();
        } catch (error) {
            console.error('Error encountered trying to fetch message: ', error);
            // Return as `reaction.message.author` may be undefined/null
            return;
        }
    }

    // check if the reaction is from the message's author
    const author = reaction.message.author;
    if (author === user)
        return;

    playerList.splice(user);
    if (playerList.includes(user))
        playerLists.delete(reaction.emoji, user);
    checkReactions();
});

bot.on("messageCreate", async message => {
    const testChannel = bot.channels.cache.find(channel => channel.id === testChannelID);

    if (message.channel == testChannel) {
        switch (message.content.toLowerCase()) {
            case "!hello":
                testChannel
                    .send(
                        "Hello, I am **" + bot.user.username + "** (" + bot.user.id + ")! <:amogus:976717839358644224>"
                    ).then(msg => {
                        msg.react("<:amogus:976717839358644224>");
                    });
                break;
            case "!postreact":
                postSchedule();
                break;
            case "!getreactmsg":
                if (reactMessage == null) {
                    testChannel.send('null');
                } else {
                    testChannel.send('React message link: ' + reactMessage.url);
                }
                break;
            case "!getplayers":
                console.log(playerList);
                list = "";
                playerList.forEach(player => list += player.username + ', ');
                testChannel.send('Players: ' + list);
                break;
        }
    }
});