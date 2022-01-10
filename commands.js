const { MessageEmbed } = require('discord.js');

const { readInFile, writeFile, SETTINGS_FILE_PATH } = require('./file_reader.js');
const { remind, sendLeaderboardMessage } = require('./reminder.js');

const { SlashCommandBuilder } = require('@discordjs/builders');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const auth = require('./auth.json');
const rest = new REST({ version: '9' }).setToken(auth.token);

// Public 

async function attemptInteractionEvaluation(interaction) {
    if (!interaction.isCommand()) return;
    
	const { commandName } = interaction;
    var succeeded = false;
    if (commandName == 'setchannel') {
        setChannel(interaction.channel);
        succeeded = true;
    } else if (commandName == 'testreminder') {
        testReminder(interaction.client);
        succeeded = true;
    } else if (commandName == 'leaderboard') {
        showLeaderboard(interaction.channel);
        succeeded = true;
    } else if (commandName == 'ping') {
        await interaction.reply({ content: 'PONG!' });
    }
    
    if (succeeded) {
        await interaction.reply({ content: 'Success!', ephemeral: true });
    }
};

function registerCommands(client) {
    for (const [guildKey, guild] of client.guilds.cache) {
        const commands = [
            new SlashCommandBuilder().setName('setchannel').setDescription('Set the current channel for the reminder to send a message in.'),
            new SlashCommandBuilder().setName('testreminder').setDescription('Run a test version of the scheduled reminder.'),
            new SlashCommandBuilder().setName('leaderboard').setDescription('Show the current leaderboard.'),
            new SlashCommandBuilder().setName('ping').setDescription('Duh.'),
        ]
            .map(command => command.toJSON());

        rest.put(Routes.applicationGuildCommands(auth.clientId, guildKey), { body: commands })
            .then(() => console.log('Successfully registered application commands.'))
            .catch(console.error);
    }
}

exports.attemptInteractionEvaluation = attemptInteractionEvaluation;
exports.registerCommands = registerCommands;

// Private

function setChannel(channel) {
    readInFile(SETTINGS_FILE_PATH, data => {
        var settings = JSON.parse(data);
        settings.channelToSendTo = channel.id;

        writeFile(SETTINGS_FILE_PATH, JSON.stringify(settings, null, '\t'), succeeded => {
            if (succeeded) {
            }
        });
    });
}

function testReminder(client) {
    remind(client);
}

function showLeaderboard(channel) {
    sendLeaderboardMessage(channel);
}