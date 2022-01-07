const { MessageEmbed } = require('discord.js');

const { readInFile, writeFile } = require('./file_reader.js');

const LEADERBOARD_FILE_PATH = './leaderboard_stats.json'

// Public

function parseMessage(message) {
    // https://github.com/kevintrankt/discord-wordle-bot/blob/main/index.ts#L258
    const wordleRegex = /Wordle \d{3} ([\dX])\/6\n{0,2}[⬛🟩🟨⬜]{5}/;
    const wordleMessage = message.content.match(wordleRegex);

    if (wordleMessage) {
        console.log(wordleMessage);

        updateLeaderboard(message, wordleMessage);
    }
}

exports.parseMessage = parseMessage;

// Helpers

function updateLeaderboard(message, wordleMessage) {
    readInFile(LEADERBOARD_FILE_PATH, data => {
        const leaderboard = JSON.parse(data);

        let score;
        if (wordleMessage[1] == 'X') {
            score = 0;
        } else {
            score = 7 - parseInt(wordleMessage[1]);
        }
        
        var pastScores = leaderboard[message.author.id];
        if (pastScores == undefined) {
            pastScores = [];
        }
        pastScores.push(score);
        leaderboard[message.author.id] = pastScores;

        writeFile(LEADERBOARD_FILE_PATH, JSON.stringify(leaderboard, null, '\t'), succeeded => {
            if (succeeded) {
                console.log("Leaderboard updated!");
            }
        });
    });
}
