# team-weekly-schedule-bot
Bot that displays player availability using player emoji reaction. The embed message is reset every 00:00 on Monday every week.

## Setting up:
1. Create a Discord bot at https://discord.com/developers/applications
2. Get the bot's private token and save it somewhere else.
3. Enable PRESENCE INTENT and SERVER MEMBERS INTENT in **Privileged Gateway Intents** section for the bot. 
4. Add the bot to your Discord server through OAuth2 -> URL Generator with:
   - Scopes: bot
   - Permissions: Send Messages, Manage Messages, Embed Links, Attach Files, Read Message History, Mention Everyone, Add Reactions 
5. Fill in the bot token, your Discord server and channels' ID, and team role ID in config.json
6. Run bot (preferably, run it 24/7).

## Running the bot
Run bot using nodemon: `nodemon ./src/bot.js`<br>
Run bot using node: `npm run start`<br>
Run with pm2:`pm2 start ./src/bot.js`<br>
Stop with pm2:`pm2 stop bot` `pm2 delete bot`
