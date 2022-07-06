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
    postSchedule();
});
resetSchedule.start();

// import MessageEmbed module for embedding message
const { MessageEmbed } = require('discord.js');

let reactEmbedMessage = null;

let playerList = [];
let naList = [];
let reactionList = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣']

const playerLists = new Map();
playerLists.set('1️⃣', []);
playerLists.set('2️⃣', []);
playerLists.set('3️⃣', []);
playerLists.set('4️⃣', []);
playerLists.set('5️⃣', []);
playerLists.set('6️⃣', []);
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

getPlayerList = async () => {
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
}

isAvailable = (teammate) => {
    let available = false;
    playerLists.forEach((l) => {
        if (l.length > 0 && l.includes(teammate)) {
            available = true;
        }
    });
    return available;
}

getNAList = () => {
    let temp = [];
    playerList.forEach(player => {
        if (!isAvailable(player)) {
            temp.push(player);
        }
    });
    return temp;
}

getReactedList = () => {
    reactEmbedMessage.embeds.forEach((embed) => {
        let fields = embed.fields;
        let i = 0;
        fields.forEach(field => {
            if (i > 6) return;
            if (field.value != "None") {
                const playerIDs = field.value.replace('<@', '').replace('>', '').split('\n');
                const players = [];
                playerIDs.forEach(id => {
                    for (let i = 0; i < playerList.length; i++) {
                        const p = playerList[i];
                        if (id == p.id) {
                            players.push(p);
                            break;
                        }
                    }
                });
                playerLists.set(reactionList[i], players);
            }
            i++;
        });
    });
}

createMessage = async () => {
    const testChannel = bot.channels.cache.find(channel => channel.id === testChannelID);
    const channel = bot.channels.cache.find(channel => channel.id === reactChannelID);

    naList = await getNAList();
    // await naList.forEach(p => console.log(p.username + ", "));

    try {
        unknownList = "";
        await naList.forEach(player => unknownList += '<@' + player + '>\n');

        list1 = list2 = list3 = list4 = list5 = list6 = list7 = "";

        let i = 1;
        playerLists.forEach((playerList, day) => {
            let temp = "None";
            if (playerList.length > 0) {
                temp = "";
                if (day == reactionList[i - 1]) {
                    playerList.forEach(player => {
                        if (temp.length > 0) temp += '\n';
                        temp += '<@' + player + '>';
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
            }
            i++;
        });

        return new MessageEmbed()
            .setColor('#00FFF2')
            .setTitle('<:amogus:976717839358644224> React to set your weekly availability <:amogus:976717839358644224>')
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
                { name: "Haven't reacted  😡:", value: unknownList },
            )
            .setTimestamp()
        // .setFooter('')
    } catch (e) {
        await testChannel.send(`Error encountered when creating react message in ${channel.name}: ${e}`);
    }
}

postSchedule = async () => {
    resetAllVars();
    await getPlayerList();

    const testChannel = bot.channels.cache.find(channel => channel.id === testChannelID);
    const channel = bot.channels.cache.find(channel => channel.id === reactChannelID);

    embedMessage = await createMessage();

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
        reactionList.forEach(emoji => {
            message.react(emoji);
        });
        reactEmbedMessage = message;
    } catch (e) {
        await testChannel.send(`Error encountered when posting react message in ${channel.name}: ${e}`);
    }
}

checkReactions = async () => {
    const testChannel = bot.channels.cache.find(channel => channel.id === testChannelID);
    const channel = bot.channels.cache.find(channel => channel.id === reactChannelID);

    try {
        await reactEmbedMessage.edit({ embeds: [await createMessage()] });
    } catch (e) {
        await testChannel.send(`Error encountered when editing react message in ${channel.name}: ${e}`);
    }
}

bot.on('ready', async () => {
    console.log("Connected.");
    console.log("Logged in as " + bot.user.username + " (" + bot.user.id + ").");

    // get message sent by bot in the react channel
    const channel = bot.channels.cache.find(channel => channel.id === reactChannelID);
    await channel.messages.fetch({ limit: 1 }).then(messages => {
        messages.forEach(message => {
            reactEmbedMessage = message;
        });
    });

    if (!reactEmbedMessage) {
        console.log("Can't find react message!");
        // const testChannel = bot.channels.cache.find(channel => channel.id === testChannelID);
        // testChannel.send("Can't find react message!");
    }
    await getPlayerList();
    await getReactedList();
});

bot.on('messageReactionAdd', async (reaction, user) => {
    // only do stuff when it's reaction from react channel
    let reactedMessage = await reaction.message.fetch();
    if (reactedMessage.channelId != reactChannelID)
        return;

    if (reaction.message != reactEmbedMessage)
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

    const temp = await playerLists.get(reaction.emoji.name);
    temp.push(user);
    playerLists.set(reaction.emoji.name, temp);
    checkReactions();
});

bot.on('messageReactionRemove', async (reaction, user) => {
    // only do stuff when it's reaction from react channel
    let reactedMessage = await reaction.message.fetch();
    // console.log(reactedMessage.channelId);
    if (reactedMessage.channelId != reactChannelID) {
        return;
    }

    if (reaction.message != reactEmbedMessage)
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

    let temp = await playerLists.get(reaction.emoji.name);
    const index = temp.indexOf(user);
    if (index > -1) temp.splice(index, 1);

    playerLists.set(reaction.emoji.name, temp);
    checkReactions();
});

bot.on("messageCreate", async message => {
    const testChannel = bot.channels.cache.find(channel => channel.id === testChannelID);

    if (message.channel == testChannel) {
        let list = "";
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
                if (reactEmbedMessage == null) {
                    testChannel.send('null');
                } else {
                    testChannel.send('React message link: ' + reactEmbedMessage.url);
                }
                break;
            case "!getplayers":
                list = "Players: ";
                playerList.forEach(player => {
                    list += player.username + ', ';
                });
                testChannel.send(list);
                break;
            case "!getschedule":
                list = "Schedule:\n";
                playerLists.forEach((pList, day) => {
                    list += `${day}: `;
                    pList.forEach(player => {
                        list += player.username + ', ';
                    });
                    list += '\n';
                });
                testChannel.send(list);
                break;
        }
    }
});