const { MessageEmbed } = require('discord.js');

const { readInFile, writeFile, SETTINGS_FILE_PATH } = require('./file_reader.js');
const { getHumanReadableMentionsList, remind } = require('./reminder.js');

const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const rest = new REST({ version: '9' }).setToken('token');

function attemptCommandEvaluation(message) {
    var messageContent = message.content;
    if (messageContent.startsWith('!scheduledMentionAdd')) {
        addMemberToMentionList(message);
    } else if (messageContent.startsWith('!scheduledMentionRemove')) {
        removeMemberFromMentionList(message);
    } else if (messageContent.startsWith('!showMentionsList')) {
        showMentionsList(message);
    } else if (messageContent.startsWith('!setChannel')) {
        setChannel(message);
    } else if (messageContent.startsWith('!testReminder')) {
        testReminder(message);
    } else if (messageContent.startsWith('!ping')) {
        ping(message);
    }
};

function registerCommands() {
    // const commands = [{
    //     name: 'ping',
    //     description: 'Replies with Pong!'
    // }];

    // (async () => {
    //     try {
    //         console.log('Started refreshing application (/) commands.');
            
    //         await rest.put(
    //             Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
    //             { body: commands },
    //         );

    //         console.log('Successfully reloaded application (/) commands.');
    //     } catch (error) {
    //         console.error(error);
    //     }
    // })();
}

function addMemberToMentionList(message) {
    readInFile(SETTINGS_FILE_PATH, (data) => {
        const userIds = message.mentions.users.map(user => {
            return user.id
        });

        var json = JSON.parse(data)
        var mentionsList = json.thoseToMention;
        for (let id of userIds) {
            if (!mentionsList.includes(id)) {
                mentionsList.push(id);
            }
        }

        json.thoseToMention = mentionsList;
        writeFile(SETTINGS_FILE_PATH, JSON.stringify(json, null, '\t'), (succeeded) => {
            if (succeeded) {
                message.react('✅');
                showMentionsList(message);
            }
        });
    });
};

function removeMemberFromMentionList(message) {
    readInFile(SETTINGS_FILE_PATH, (data) => {
        const userIds = message.mentions.users.map(user => {
            return user.id
        });

        var json = JSON.parse(data)
        var mentionsList = json.thoseToMention;
        for (let id of userIds) {
            if (mentionsList.includes(id)) {
                mentionsList = mentionsList.filter((value, index, array) => {
                    return value !== id;
                });
            }
        }

        json.thoseToMention = mentionsList;
        writeFile(SETTINGS_FILE_PATH, JSON.stringify(json, null, '\t'), (succeeded) => {
            if (succeeded) {
                message.react('✅');
                showMentionsList(message);
            }
        });
    });
};

function showMentionsList(message) {
    readInFile(SETTINGS_FILE_PATH, (data) => {
        var mentionsList = JSON.parse(data).thoseToMention;
        const embedMessage = new MessageEmbed()
            .setTitle('These suckers are in the list:')
            .setColor('0xccff33')
            .setDescription(getHumanReadableMentionsList(mentionsList));
        message.channel.send(embedMessage);
    });
}

function setChannel(message) {
    readInFile(SETTINGS_FILE_PATH, data => {
        var settings = JSON.parse(data);
        settings.channelToSendTo = message.channel.id;
        
        writeFile(MENTION_LIST_FILE_PATH, JSON.stringify(settings, null, '\t'), succeeded => {
            if (succeeded) {
                message.react('✅');
            }
        });
    });
}

function testReminder(message) {
    remind(message.client);
}

function ping(message) {
    message.channel.send('PONG! but better than the other bots...');
}

exports.attemptCommandEvaluation = attemptCommandEvaluation;
exports.registerCommands = registerCommands;