const { MessageEmbed } = require('discord.js');

const { SETTINGS_FILE_PATH, readInFile, writeFile } = require('./file_reader.js');
const { LEADERBOARD_FILE_PATH } = require('./leaderboard.js');

var mentionsList = [];
var thoseThatAreIn = [];
var thoseThatAreOut = [];

var savedMessage = null;

// Public

function scheduleReminder(client) {
    readInFile(SETTINGS_FILE_PATH, data => {
        const settings = JSON.parse(data);
        const differenceNowToScheduledTime = settings.timeToSendMessage - Date.now();
        setTimeout(() => {
            reminder(client, true);
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
                const offsetTime = 5; // One day
                settings.timeToSendMessage += offsetTime;
                writeFile(SETTINGS_FILE_PATH, JSON.stringify(settings, null, '\t'), succeeded => {
                    if (succeeded) {
                        scheduleReminder(client);
                    }
                });
            }

            readInFile(LEADERBOARD_FILE_PATH, data => {
                const leaderboard = JSON.parse(data);

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

                const messageToSend = new MessageEmbed()
                    .setTitle('⬛⬜🟨🟩🟩🟨⬜⬛')
                    .setURL('https://www.powerlanguage.co.uk/wordle/')
                    .setColor('0x91f59e')
                    .setDescription('Current leaderboard:')
                    .setFields(
                        { name: '🙇 Who', value: nameList, inline: true },
                        { name: '🎆 Average', value: averageList, inline: true },
                        { name: '💯 Total', value: totalList, inline: true },

                        { name: 'Attempts', value: `${numberOfItems}`, inline: true },
                        { name: 'Overall Average', value: `${sumOfAll / numberOfItems}`, inline: true },
                        { name: 'Sum', value: `${sumOfAll}`, inline: true }
                    );
                const messageContent = `New <@&${wordleRoll}> just dropped!`;
    
                channel.send({ content: messageContent, embeds: [messageToSend] })
            });
        }
    })
};

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

exports.scheduleReminder = scheduleReminder;
exports.remind = remind;
