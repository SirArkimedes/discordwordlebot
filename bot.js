const { Client, Intents } = require('discord.js');

const auth = require('./auth.json');
const commands = require('./commands.js');
const { scheduleRollCall } = require('./rollcall.js');

const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
  commands.registerCommands();
  scheduleRollCall(client);
});

client.on('message', message => {
  commands.attemptCommandEvaluation(message);
});

client.login(auth.token);
