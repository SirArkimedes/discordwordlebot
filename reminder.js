const { MessageEmbed } = require('discord.js');

const { SETTINGS_FILE_PATH, readInFile, writeFile } = require('./file_reader.js');

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

        for (const [guildKey, guild] of client.guilds.cache) {
            for (const [channelKey, cachedChannel] of guild.channels.cache) {
                if (channelKey == settings.channelToSendTo) {
                    channel = cachedChannel;
                }
            }
        }

        if (channel === null) {
            console.log('Cannot find channel described in settings!');
        } else {
            if (isFromScheduler) {
                const offsetTime = 86400; // One day
                settings.timeToSendMessage += offsetTime;
                writeFile(SETTINGS_FILE_PATH, JSON.stringify(settings, null, '\t'), succeeded => {
                    if (succeeded) {
                        scheduleReminder(client);
                    }
                });
            }

            thoseThatAreIn = [];
            thoseThatAreOut = [];
            mentionsList = settings.thoseToMention;
            const messageToSend = new MessageEmbed()
                .setTitle('📝 Who\'s going to be joining us tonight?')
                .setColor('0xccff33')
                .setDescription(getDescription());
            const messageContent = `${getHumanReadableMentionsList(mentionsList)} are you in?`;

            channel.send({ content: messageContent, embed: messageToSend })
        }
    })
};

function getHumanReadableMentionsList(mentionsList) {
    var thoseToMention = '';
    for (i = 0; i < mentionsList.length; i++) {
        if (mentionsList.length != 1 && i == mentionsList.length - 1) {
            thoseToMention += ' and '
        }

        thoseToMention += `<@${mentionsList[i]}>`

        if (mentionsList.length != 1 && i != mentionsList.length - 1 && mentionsList.length != 2) {
            thoseToMention += ', '
        }
    }
    return thoseToMention;
}

// Helpers

function getDescription() {
    var description = 'React to this message to mark that you\'re in or out for tonight!';

    var thoseThatHaveNotResponded = [];
    for (id of mentionsList) {
        if (!thoseThatAreIn.includes(id) && !thoseThatAreOut.includes(id)) {
            thoseThatHaveNotResponded.push(id);
        }
    }
    if (thoseThatHaveNotResponded.length > 0) {
        description += `\n\nThose that have not responded: \n${getHumanReadableMentionsList(thoseThatHaveNotResponded)}`
    }

    if (thoseThatAreIn.length > 0) {
        description += `\n\nThose in: 🙋\n${getHumanReadableMentionsList(thoseThatAreIn)}`
    }
    if (thoseThatAreOut.length > 0) {
        description += `\n\nThose out: 😢\n${getHumanReadableMentionsList(thoseThatAreOut)}`
    }
    return description;
}

exports.scheduleReminder = scheduleReminder;
exports.remind = remind;
exports.getHumanReadableMentionsList = getHumanReadableMentionsList;