const { MessageEmbed } = require('discord.js');

const { SETTINGS_FILE_PATH, readInFile, writeFile } = require('./file_reader.js');
const { LEADERBOARD_FILE_PATH } = require('./leaderboard.js');

var savedMessage = null;

// Public

function scheduleReminder(client) {
    readInFile(SETTINGS_FILE_PATH, data => {
        const settings = JSON.parse(data);
        const differenceNowToScheduledTime = settings.timeToSendMessage - Date.now();
        setTimeout(() => {
            remind(client, true);
        }, differenceNowToScheduledTime);
    });
}

function remind(client, isFromScheduler = false) {
    readInFile(SETTINGS_FILE_PATH, data => {
        const settings = JSON.parse(data);
        var channel = null;
        var wordleRoll = null;

        for (const [guildKey, guild] of client.guilds.cache) {
            for (const [channelKey, cachedChannel] of guild.channels.cache) {
                if (channelKey == settings.channelToSendTo) {
                    channel = cachedChannel;
                }
            }

            for (const [roleKey, role] of guild.roles.cache) {
                if (role.name == 'wordle') {
                    wordleRoll = role.id;
                }
            }
        }

        if (channel === null) {
            console.log('Cannot find channel described in settings!');
        } else {
            if (isFromScheduler) {
                const offsetTime = 86400000; // One day in milliseconds
                settings.timeToSendMessage += offsetTime;
                writeFile(SETTINGS_FILE_PATH, JSON.stringify(settings, null, '\t'), succeeded => {
                    if (succeeded) {
                        scheduleReminder(client);
                    }
                });
            }

            sendLeaderboardMessage(channel, `New <@&${wordleRoll}> just dropped!`);
        }
    })
};

function updateSavedMessageLeaderboard(leaderboard) {
    if (savedMessage !== null) {
        const editedEmbed = new MessageEmbed(savedMessage.embeds[0]);
        editedEmbed.setFields(getMessageFields(leaderboard));
        savedMessage.edit({ embeds: [editedEmbed] }).then(editedMessage => {
            savedMessage = editedMessage;
        });
    }
}

function sendLeaderboardMessage(channel, messageContent) {
    readInFile(LEADERBOARD_FILE_PATH, data => {
        const leaderboard = JSON.parse(data);
        const messageToSend = new MessageEmbed()
            .setTitle('?????????????? Click me to log your result! ??????????????')
            .setURL('https://www.powerlanguage.co.uk/wordle/')
            .setColor('0x91f59e')
            .setDescription('Current leaderboard:')
            .setFields(getMessageFields(leaderboard));

        var message = null;
        if (messageContent == null) {
            message = { embeds: [messageToSend] }
        } else {
            message = { content: messageContent, embeds: [messageToSend] }
        }

        channel.send(message)
            .then(embededMessage => {
                savedMessage = embededMessage;
            });
    });
}

exports.scheduleReminder = scheduleReminder;
exports.remind = remind;
exports.updateSavedMessageLeaderboard = updateSavedMessageLeaderboard;
exports.sendLeaderboardMessage = sendLeaderboardMessage;

// Helpers

function getSortedLeaderboard(leaderboard_json) {
    var values = [];
    Object.entries(leaderboard_json).forEach(function([key, scores]) {
        total = 0;
        for (const value of scores) {
            total += value;
        }

        values.push({ "user": `<@${key}>`, "total": total, "average": total / scores.length })
    });
    values.sort(function(left, right) {
        return right.total - left.total
    })
    return values;
}

function getMessageFields(leaderboard) {
    var nameList = '';
    var averageList = '';
    var totalList = '';
    var numberOfItems = 0;
    var sumOfAll = 0;
    for (const entry of getSortedLeaderboard(leaderboard)) {
        nameList += `${entry.user}\n`;
        averageList += `${entry.average}\n`;
        totalList += `${entry.total}\n`;

        numberOfItems += entry.total / entry.average;
        sumOfAll += entry.total;
    }

    return [
        { name: '???? Who', value: nameList, inline: true },
        { name: '???? Average', value: averageList, inline: true },
        { name: '???? Total', value: totalList, inline: true },

        { name: 'Attempts', value: `${numberOfItems}`, inline: true },
        { name: 'Overall Average', value: `${sumOfAll / numberOfItems}`, inline: true },
        { name: 'Sum', value: `${sumOfAll}`, inline: true },
    ];
}
