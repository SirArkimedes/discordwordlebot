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

  if (process.env.WORDLE_BOT_AUTH_TOKEN != null) {
    auth.token = process.env.WORDLE_BOT_AUTH_TOKEN
  }

  if (process.env.WORDLE_BOT_CLIENT_ID != null) {
    auth.clientId = process.env.WORDLE_BOT_CLIENT_ID
  }

  commands.registerCommands(client, auth.token, auth.clientId);
  scheduleReminder(client);
});

client.on('messageCreate', message => {
  leaderboard.parseMessage(message);
});

client.on('interactionCreate', async interaction => {
  await commands.attemptInteractionEvaluation(interaction);
});

client.login(auth.token);
