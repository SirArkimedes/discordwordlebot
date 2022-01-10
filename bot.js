const { Client, Intents } = require('discord.js');

const auth = require('./auth.json');
const commands = require('./commands.js');
const leaderboard = require('./leaderboard.js');
const { scheduleReminder } = require('./reminder.js');

const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
  ]
});

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
  commands.registerCommands(client);
  scheduleReminder(client);
});

client.on('messageCreate', message => {
  leaderboard.parseMessage(message);
});

client.on('interactionCreate', async interaction => {
  await commands.attemptInteractionEvaluation(interaction);
});

client.login(auth.token);
