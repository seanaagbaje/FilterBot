# FilterBot
# FilterBot

FilterBot is a Discord bot designed to automatically scan and manage new users attempting to join a server. The bot prevents anyone with blacklisted words in their profile name or user ID from joining, except for the server creator and whitelisted users. This bot uses slash commands for its user interface and runs independently on a hosting platform like Heroku.

## Features

- **User Scanning and Blocking**: Automatically scans all new users attempting to join the server and prevents users with "kellyohgee" in their username or user ID from joining, except for the server creator and whitelisted users.
- **Slash Command Protocol**: Use slash commands (/) for bot interaction and management.
- **Whitelisting**: Allow administrators to add or remove users from the whitelist.
- **Logging and Reporting**: Track attempted entries and actions taken by the bot, and provide commands to view logs and generate reports.
- **Error Handling**: Implement error handling to ensure smooth operation and provide meaningful feedback to users and administrators.
- **Additional Commands**: Commands to list all whitelisted users, manually block or unblock a specific user, and toggle the bot's active status.

## Example Commands

- `/whitelist add <user>`: Add a user to the whitelist.
- `/whitelist remove <user>`: Remove a user from the whitelist.
- `/block <user>`: Manually block a user.
- `/unblock <user>`: Manually unblock a user.
- `/status`: Check the bot's status.
- `/logs`: View recent activity logs.
- `/toggle`: Enable or disable the bot's user scanning feature.

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/FilterBot.git
   cd FilterBot
