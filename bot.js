const { Client, Intents } = require('discord.js');

const auth = require('./auth.json');
const commands = require('./commands.js');
const leaderboard = require('./leaderboard.js');
const { scheduleRollCall } = require('./rollcall.js');

const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES
  ]
});

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
  commands.registerCommands();
  scheduleRollCall(client);
});

client.on('messageCreate', message => {
  commands.attemptCommandEvaluation(message);
  leaderboard.parseMessage(message);
});

client.login(auth.token);
