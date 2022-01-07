<p align="center">
  <img src="Rounded Logo.png" alt="icon" width="300" height="300">
</p>

# 📝 Discord Wordle Reminder Bot
* Tired of always trying to remember to play the new Wordle? We were too.
* Introducing Discord Wordle Reminder Bot! 📝 A one-stop-shop for asking you and your friends to play the wordle challenge that day.

# How to run
### Requirement
* Node

### Setup process
1. Run `npm install`.
2. Create a bot with Discord [here](https://discordapp.com/developers/applications/me).
3. Invite the newly created bot to a server with this link, replacing CLIENT with your bot's client ID: https://discordapp.com/oauth2/authorize?client_id=CLIENT&scope=bot
4. Copy the bot's OAuth token from the Discord dashboard at the link in step 2.
5. Create an `auth.json` file in the root folder with the following format and where the bot token can be found in the Discord dashboard:
  ` {
      "token": "YOUR BOT TOKEN HERE"
  } `
6. Modify the `settings.json` `timeToSendMessage` value to be something in the future. (It uses [Unix Time](https://www.epochconverter.com/).)
7. Run `node bot.js`.
8. Add a `wordle` role to your Discord server and add those that should be pinged when the reminder goes off to that role!

### Usage
1. Once added to your server from the steps in [Setup process](https://github.com/SirArkimedes/discordrollcallbot#setup-process), run `!setChannel` to tell the bot which channel to send the scheduled message.
2. Run `!testReminder` to see what happens!
3. Peruse the [Commands](https://github.com/SirArkimedes/discordwordlebot#commands) section to apply any other customizations!

### Commands
* `!setChannel` - Sets the channel at which to send the scheduled roll call to.
* `!testReminder` - Sends a non-scheduled reminder message.
* `!ping` - Responds with a message to show that the bot is alive and well.

# Thanks!
* This project was made for those that play wordle.
* Thanks for checking it out!

<p align="center">
  Made with ❤️ by  <a href="https://github.com/SirArkimedes">SirArkimedes</a>.
</p>
