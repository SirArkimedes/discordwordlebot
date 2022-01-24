const { MessageEmbed } = require('discord.js');

const { readInFile, writeFile } = require('./file_reader.js');
const reminder = require('./reminder.js');

const LEADERBOARD_FILE_PATH = './leaderboard_stats.json'

// Public

function parseMessage(message) {
    // https://github.com/kevintrankt/discord-wordle-bot/blob/main/index.ts#L258
    const wordleRegex = /Wordle \d{3} ([\dX])\/6\n{0,2}[⬛🟩🟨⬜]{5}/;
    const hardWordleRegex = /Wordle \d{3} ([\dX])\/6\*\n{0,2}[⬛🟩🟨⬜]{5}/;
    const wordleMessage = message.content.match(wordleRegex);
    const hardWordleMessage = message.content.match(hardWordleRegex);

    if (wordleMessage) {
        updateLeaderboard(message, wordleMessage, false);
    }
    if (hardWordleMessage) {
        updateLeaderboard(message, hardWordleMessage, true);
    }
}

exports.LEADERBOARD_FILE_PATH = LEADERBOARD_FILE_PATH;
exports.parseMessage = parseMessage;

// Helpers

function updateLeaderboard(message, wordleMessage, hardMode=false) {
    readInFile(LEADERBOARD_FILE_PATH, data => {
        const leaderboard = JSON.parse(data);

        let score;
        if (wordleMessage[1] == 'X') {
            score = 0;
        } else {
            score = 7 - parseInt(wordleMessage[1]);

            if (hardMode) {
                score += 1;
            }
        }
        console.log(score);
        
        var pastScores = leaderboard[message.author.id];
        if (pastScores == undefined) {
            pastScores = [];
        }
        pastScores.push(score);
        leaderboard[message.author.id] = pastScores;

        writeFile(LEADERBOARD_FILE_PATH, JSON.stringify(leaderboard, null, '\t'), succeeded => {
            if (succeeded) {
                console.log("Leaderboard updated!");
                message.react('✅');

                reminder.updateSavedMessageLeaderboard(leaderboard);
            }
        });
    });
}
