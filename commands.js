const { MessageEmbed } = require('discord.js');

const { readInFile, writeFile, SETTINGS_FILE_PATH } = require('./file_reader.js');
const { getHumanReadableMentionsList, remind } = require('./reminder.js');

const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const rest = new REST({ version: '9' }).setToken('token');

function attemptCommandEvaluation(message) {
    var messageContent = message.content;
    if (messageContent.startsWith('!setChannel')) {
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

function setChannel(message) {
    readInFile(SETTINGS_FILE_PATH, data => {
        var settings = JSON.parse(data);
        settings.channelToSendTo = message.channel.id;
        
        writeFile(SETTINGS_FILE_PATH, JSON.stringify(settings, null, '\t'), succeeded => {
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