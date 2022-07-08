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

const { CronJob } = require("cron");
// reset weekly schedule at 00:00 every Monday
const resetSchedule = new CronJob("0 0 * * 1", () => {
    postSchedule();
});
resetSchedule.start();

// import MessageEmbed module for embedding message
const { MessageEmbed } = require('discord.js');

// ========================================== //
// ================== INIT ================== //
// ========================================== //
// read config file
const fs = require('fs');
let config = JSON.parse(fs.readFileSync(__dirname + '/config.json', 'utf8'));

// login to discord
bot.login(config['discordBotToken']);

let testChannel = null;
let reactChannel = null;

const unavailableEmoji = '❌';
let reactEmbedMessage = null;
let mainList = [];
let subList = [];
let naList = [];
let reactionList = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', unavailableEmoji]

const scheduleList = new Map();
scheduleList.set('1️⃣', []);
scheduleList.set('2️⃣', []);
scheduleList.set('3️⃣', []);
scheduleList.set('4️⃣', []);
scheduleList.set('5️⃣', []);
scheduleList.set('6️⃣', []);
scheduleList.set('7️⃣', []);
scheduleList.set(unavailableEmoji, []);

// =============================================== //
// ================== FUNCTIONS ================== //
// =============================================== //
resetAllVars = () => {
    mainList = [];
    subList = [];
    scheduleList.set('1️⃣', []);
    scheduleList.set('2️⃣', []);
    scheduleList.set('3️⃣', []);
    scheduleList.set('4️⃣', []);
    scheduleList.set('5️⃣', []);
    scheduleList.set('6️⃣', []);
    scheduleList.set('7️⃣', []);
    scheduleList.set(unavailableEmoji, []);
}

getPlayerList = async () => {
    // Get player list
    let members = null;
    try {
        const guild = await bot.guilds.fetch(config['serverID']);
        members = await guild.members.fetch();
    } catch (e) {
        await testChannel.send(`Error encountered when getting player list in ${reactChannel.name}: ${e}`);
    }

    members.forEach(member => {
        if (member._roles.includes(config['mainTeamRoleID'])) {
            mainList.push(member.user);
        } else if (config['subTeamRoleID'].trim() != "" && (!member._roles.includes(config['mainTeamRoleID']) && member._roles.includes(config['subTeamRoleID']))) {
            subList.push(member.user);
        }
    });

    // print player list for debug
    // mainList.forEach(player => console.log(player.username));
}

isAvailable = (teammate) => {
    let available = false;
    scheduleList.forEach((l) => {
        if (l.length > 0 && l.includes(teammate)) {
            available = true;
        }
    });
    return available;
}

getNAList = () => {
    let temp = [];
    mainList.forEach(player => {
        if (!isAvailable(player)) {
            temp.push(player);
        }
    });
    subList.forEach(player => {
        if (!isAvailable(player)) {
            temp.push(player);
        }
    });
    return temp;
}

// get users in reacts and add them to the schedule list
getReactedList = async () => {
    if (!reactEmbedMessage)
        return;

    const reactions = reactEmbedMessage.reactions;
    for (let i = 0; i < reactionList.length; i++) {
        const reaction = reactions.resolve(reactionList[i]);
        const reactedUsers = await reaction.users.fetch();

        let temp = [];
        await reactedUsers.forEach(user => {
            if (reaction.message.author != user) {
                temp.push(user);
            }
        });
        scheduleList.set(reaction.emoji.name, temp);
    }
}

createMessage = async () => {

    naList = await getNAList();
    // await naList.forEach(p => console.log(p.username + ", "));

    try {
        let unknownList = "";
        await naList.forEach(player => {
            unknownList += '<@' + player + '>';
            if (subList.includes(player)) {
                unknownList += ' (S)';
            }
            unknownList += '\n';
        });

        let list1 = list2 = list3 = list4 = list5 = list6 = list7 = "";
        let unavailableListStr = "";

        let i = 1;
        scheduleList.forEach((plist, day) => {
            let temp = "None";
            if (plist.length > 0) {
                temp = "";
                if (day == reactionList[i - 1]) {
                    plist.forEach(player => {
                        temp += '<@' + player + '>';
                        if (subList.includes(player)) {
                            temp += ' (S)';
                        }
                        temp += '\n';

                        const index = naList.indexOf(player);
                        if (index > -1) {
                            naList.splice(index, 1);
                        }
                    });
                }
            }
            switch (i) {
                case 1:
                    list1 = temp;
                    break;
                case 2:
                    list2 = temp;
                    break;
                case 3:
                    list3 = temp;
                    break;
                case 4:
                    list4 = temp;
                    break;
                case 5:
                    list5 = temp;
                    break;
                case 6:
                    list6 = temp;
                    break;
                case 7:
                    list7 = temp;
                    break;
                case 8:
                    unavailableListStr = temp;
                    break;
            }
            i++;
        });

        if (naList.length > 0) {
            return new MessageEmbed()
                .setColor('#00FFF2')
                .setTitle('React to set your weekly availability')
                .setDescription("```Monday = 1, Tuesday = 2, Wednesday = 3, Thursday = 4\nFriday = 5, Saturday = 6, Sunday = 7\nCompletely unavailable = ❌```")
                .addFields(
                    { name: 'Monday', value: list1, inline: true },
                    { name: 'Tuesday', value: list2, inline: true },
                    { name: 'Wednesday', value: list3, inline: true },
                    { name: 'Thursday', value: list4, inline: true },
                    { name: 'Friday', value: list5, inline: true },
                    { name: 'Saturday', value: list6, inline: true },
                    { name: 'Sunday', value: list7, inline: true },
                    { name: '\u200B', value: '\u200B' },
                    { name: "Completely unavailable:", value: unavailableListStr, inline: true },
                    { name: "Haven't reacted  😡:", value: unknownList, inline: true },
                )
                .setTimestamp()
        }
        return new MessageEmbed()
            .setColor('#00FFF2')
            .setTitle('React to set your weekly availability')
            .setDescription("```Monday = 1, Tuesday = 2, Wednesday = 3, Thursday = 4\nFriday = 5, Saturday = 6, Sunday = 7\nCompletely unavailable = ❌```")
            .addFields(
                { name: 'Monday', value: list1, inline: true },
                { name: 'Tuesday', value: list2, inline: true },
                { name: 'Wednesday', value: list3, inline: true },
                { name: 'Thursday', value: list4, inline: true },
                { name: 'Friday', value: list5, inline: true },
                { name: 'Saturday', value: list6, inline: true },
                { name: 'Sunday', value: list7, inline: true },
                { name: '\u200B', value: '\u200B' },
                { name: "Completely unavailable:", value: unavailableListStr, inline: true }
            )
            .setTimestamp()
    } catch (e) {
        await testChannel.send(`Error encountered when creating react message in ${reactChannel.name}: ${e}`);
    }
}

postSchedule = async () => {
    resetAllVars();
    await getPlayerList();

    embedMessage = await createMessage();

    try {
        await reactChannel.messages.fetch({ limit: 5 })
            .then(messages => {
                messages.forEach(message => {
                    message.delete();
                });
            });
    } catch (e) {
        await testChannel.send(`Error encountered while deleting react message in channel ${reactChannel.name}: ${e}`);
    }

    let message = null;
    try {
        message = await reactChannel.send({ embeds: [embedMessage] });

        // add reactions
        reactionList.forEach(emoji => {
            message.react(emoji);
        });
        reactEmbedMessage = message;
    } catch (e) {
        await testChannel.send(`Error encountered when posting react message in ${reactChannel.name}: ${e}`);
    }
}

editReactions = async () => {
    try {
        await reactEmbedMessage.edit({ embeds: [await createMessage()] });
    } catch (e) {
        await testChannel.send(`Error encountered when editing react message in ${reactChannel.name}: ${e}`);
    }
}

checkReactions = async () => {
    await getReactedList();
    try {
        await reactEmbedMessage.edit({ embeds: [await createMessage()] });
    } catch (e) {
        await testChannel.send(`Error encountered when editing react message in ${reactChannel.name}: ${e}`);
    }
}

checkTargetReaction = async (targetReaction, targetUser) => {
    const targetEmoji = targetReaction.emoji.name;
    if (targetEmoji == unavailableEmoji) {
        const reactions = reactEmbedMessage.reactions;
        for (let i = 0; i < reactionList.length; i++) {
            const emoji = reactionList[i];
            if (emoji != unavailableEmoji) {
                const reaction = await reactions.resolve(emoji);
                const reactedUsers = await reaction.users.fetch();
                await reactedUsers.forEach(async u => {
                    if (u.id == targetUser.id) {
                        let temp = await scheduleList.get(targetEmoji);
                        const index = temp.indexOf(targetUser);
                        if (index > -1) temp.splice(index, 1);
                        scheduleList.set(targetEmoji, temp);

                        removedByBot = true;
                        await reaction.users.remove(targetUser.id);
                        return;
                    }
                });
            }
        }
    } else {
        const reactions = reactEmbedMessage.reactions;
        for (let i = 0; i < reactionList.length; i++) {
            const emoji = reactionList[i];
            if (emoji == unavailableEmoji) {
                const reaction = await reactions.resolve(emoji);
                const reactedUsers = await reaction.users.fetch();
                await reactedUsers.forEach(async u => {
                    if (u.id == targetUser.id) {
                        let temp = await scheduleList.get(targetEmoji);
                        const index = temp.indexOf(targetUser);
                        if (index > -1) temp.splice(index, 1);
                        scheduleList.set(targetEmoji, temp);

                        removedByBot = true;
                        await reaction.users.remove(targetUser.id);
                        return;
                    }
                });
            }
        }
    }
}

// ========================================= //
// ================== BOT ================== //
// ========================================= //
let removedByBot = false;
let reactCheck = null;
let reactCheckDelayTimer = 5000;
bot.on('ready', async () => {
    console.log("Connected.");
    console.log("Logged in as " + bot.user.username + " (" + bot.user.id + ").");

    testChannel = bot.channels.cache.find(channel => channel.id === config['testChannelID']);
    reactChannel = bot.channels.cache.find(channel => channel.id === config['reactChannelID']);
    
    // get message sent by bot in the react channel
    await reactChannel.messages.fetch({ limit: 1 }).then(messages => {
        messages.forEach(message => {
            reactEmbedMessage = message;
        });
    });

    if (!reactEmbedMessage) {
        console.log("Can't find react message!");
        // testChannel.send("Can't find react message!");
    }
    await getPlayerList();
    await checkReactions();
});

bot.on('messageReactionAdd', async (reaction, user) => {
    // only do stuff when it's reaction from react channel
    let reactedMessage = await reaction.message.fetch();
    if (reactedMessage.channelId != config['reactChannelID'])
        return;

    if (reaction.message != reactEmbedMessage)
        return;

    // When a reaction is received, check if the structure is partial
    if (reaction.partial) {
        // If the message this reaction belongs to was removed, the fetching might result in an API error which should be handled
        try {
            await reaction.fetch();
        } catch (e) {
            console.error('Error encountered trying to fetch message: ', e);
            // Return as `reaction.message.author` may be undefined/null
            return;
        }
    }

    // check if the reaction is from the message's author
    if (reaction.message.author === user)
        return;

    await checkTargetReaction(reaction, user);

    const temp = await scheduleList.get(reaction.emoji.name);
    temp.push(user);
    scheduleList.set(reaction.emoji.name, temp);
    await editReactions();

    if (reactCheck != null) {
        clearTimeout(reactCheck);
        reactCheck = null;
    }
    reactCheck = setTimeout(async () => {
        checkReactions();
    }, reactCheckDelayTimer);
});

bot.on('messageReactionRemove', async (reaction, user) => {
    if (removedByBot) {
        removedByBot = false;
        return;
    }

    // only do stuff when it's reaction from react channel
    let reactedMessage = await reaction.message.fetch();
    if (reactedMessage.channelId != config['reactChannelID'])
        return;

    if (reaction.message != reactEmbedMessage)
        return;

    // When a reaction is received, check if the structure is partial
    if (reaction.partial) {
        // If the message this reaction belongs to was removed, the fetching might result in an API error which should be handled
        try {
            await reaction.fetch();
        } catch (e) {
            console.error('Error encountered trying to fetch message: ', e);
            // Return as `reaction.message.author` may be undefined/null
            return;
        }
    }

    // check if the reaction is from the message's author
    if (reaction.message.author === user)
        return;

    let temp = await scheduleList.get(reaction.emoji.name);
    const index = temp.indexOf(user);
    if (index > -1) temp.splice(index, 1);
    scheduleList.set(reaction.emoji.name, temp);
    await editReactions();

    if (reactCheck != null) {
        clearTimeout(reactCheck);
        reactCheck = null;
    }
    reactCheck = setTimeout(async () => {
        checkReactions();
    }, reactCheckDelayTimer);
});

bot.on("messageCreate", async message => {
    if (message.channel == testChannel) {
        let list = "";
        switch (message.content.toLowerCase()) {
            case "!hello":
                testChannel
                    .send(
                        "Hello, I am **" + bot.user.username + "** (" + bot.user.id + ")!"
                    )
                // .then(msg => {
                //     msg.react("<:amogus:976717839358644224>");
                // });
                break;
            case "!postreact":
                postSchedule();
                break;
            case "!getreactmsg":
                if (reactEmbedMessage == null) {
                    testChannel.send('null');
                } else {
                    testChannel.send('React message link: ' + reactEmbedMessage.url);
                }
                break;
            case "!checkreactions":
                await checkReactions();
                break;
            case "!getmain":
                list = "Main roster players: ";
                mainList.forEach(player => {
                    list += player.username + ', ';
                });
                testChannel.send(list);
                break;
            case "!getsub":
                list = "Sub players: ";
                subList.forEach(player => {
                    list += player.username + ', ';
                });
                testChannel.send(list);
                break;
            case "!getschedule":
                list = "Schedule:\n";
                const weekDay = new Map();
                weekDay.set('1️⃣', "Monday");
                weekDay.set('2️⃣', "Tuesday");
                weekDay.set('3️⃣', "Wednesday");
                weekDay.set('4️⃣', "Thursday");
                weekDay.set('5️⃣', "Friday");
                weekDay.set('6️⃣', "Saturday");
                weekDay.set('7️⃣', "Sunday");
                weekDay.set(unavailableEmoji, "Unavailable");

                scheduleList.forEach((pList, day) => {
                    list += `**${weekDay.get(day)}**: `;
                    pList.forEach(player => {
                        list += player.username + ', ';
                    });
                    list += '\n';
                });
                testChannel.send(list);
                break;
            case "!commands":
                testChannel.send("Commands: !hello, !postreact, !getreactmsg, !checkreactions, !getmain, !getsub, !getschedule");
                break;
        }
    }
});