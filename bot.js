
const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const fs = require('fs');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMessages] });

// const token = '';
// const guildId = '';
// const creatorId = '';
// const whitelist = new Set([creatorId]); // Initialize with the server creator




const commands = [
  new SlashCommandBuilder()
    .setName('whitelist')
    .setDescription('Manage the whitelist')
    .addSubcommand(subcommand => 
      subcommand.setName('add').setDescription('Add a user to the whitelist')
        .addUserOption(option => option.setName('user').setDescription('The user to whitelist').setRequired(true)))
    .addSubcommand(subcommand => 
      subcommand.setName('remove').setDescription('Remove a user from the whitelist')
        .addUserOption(option => option.setName('user').setDescription('The user to remove from the whitelist').setRequired(true))),
  new SlashCommandBuilder()
    .setName('block')
    .setDescription('Block a user')
    .addUserOption(option => option.setName('user').setDescription('The user to block').setRequired(true)),
  new SlashCommandBuilder()
    .setName('unblock')
    .setDescription('Unblock a user')
    .addUserOption(option => option.setName('user').setDescription('The user to unblock').setRequired(true)),
  new SlashCommandBuilder()
    .setName('status')
    .setDescription('Check the bot\'s status'),
  new SlashCommandBuilder()
    .setName('logs')
    .setDescription('View recent activity logs'),
  new SlashCommandBuilder()
    .setName('toggle')
    .setDescription('Enable or disable the bot\'s user scanning feature')
].map(command => command.toJSON());

client.once('ready', async () => {
  console.log(`Logged in as ${client.user.tag}!`);
  
  const rest = new REST({ version: '10' }).setToken(token);

  try {
    console.log('Started refreshing application (/) commands.');
    await rest.put(
      Routes.applicationGuildCommands(client.user.id, guildId),
      { body: commands },
    );
    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error('Error refreshing application (/) commands:', error);
  }
});

client.on('guildMemberAdd', async member => {
  try {
    console.log(`New member joined: ${member.user.tag} (${member.id})`);
    
    if (member.user.username.includes('kellyohgee') && !whitelist.has(member.id)) {
      console.log(`Prohibited username detected: ${member.user.tag}`);
      
      await member.kick('Username not allowed');
      logAction(`Kicked ${member.user.tag} for having a prohibited username.`);
      notifyAdmins(`User ${member.user.tag} was kicked for having a prohibited username.`);

      const embed = new EmbedBuilder()
        .setTitle('Join Ticket')
        .setDescription('A ticket has been opened. Press the button below to join it.')
        .setColor(0x00ff00)
        .addFields(
          { name: 'Opened By', value: `${member.user.tag}`, inline: true },
          { name: 'Panel', value: 'Open a ticket!', inline: true },
          { name: 'Staff In Ticket', value: '0', inline: true }
        )
        .setFooter({ text: 'Powered by yourbot' });

      const row = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('join_ticket')
            .setLabel('Join Ticket')
            .setStyle(ButtonStyle.Primary)
        );

      const adminChannel = client.channels.cache.find(channel => channel.name === 'admin-notifications');
      if (adminChannel) {
        await adminChannel.send({ embeds: [embed], components: [row] });
      }
    }
  } catch (error) {
    console.error('Error processing guild member addition:', error);
    notifyAdmins(`Error processing new member ${member.user.tag}: ${error.message}`);
  }
});

client.on('interactionCreate', async interaction => {
  if (interaction.isCommand()) {
    const { commandName } = interaction;

    if (commandName === 'whitelist') {
      const subcommand = interaction.options.getSubcommand();
      const user = interaction.options.getUser('user');
      if (subcommand === 'add') {
        whitelist.add(user.id);
        const embed = new EmbedBuilder()
          .setTitle('Whitelist Update')
          .setDescription(`Added ${user.tag} to the whitelist.`)
          .setColor(0x00ff00);
        await interaction.reply({ embeds: [embed], ephemeral: true });
        logAction(`Added ${user.tag} (${user.id}) to the whitelist.`);
      } else if (subcommand === 'remove') {
        whitelist.delete(user.id);
        const embed = new EmbedBuilder()
          .setTitle('Whitelist Update')
          .setDescription(`Removed ${user.tag} from the whitelist.`)
          .setColor(0xff0000);
        await interaction.reply({ embeds: [embed], ephemeral: true });
        logAction(`Removed ${user.tag} (${user.id}) from the whitelist.`);
      }
    } else if (commandName === 'block') {
      const user = interaction.options.getUser('user');
      const embed = new EmbedBuilder()
        .setTitle('Block User')
        .setDescription(`Blocked user ${user.tag}.`)
        .setColor(0xff0000);
      await interaction.reply({ embeds: [embed], ephemeral: true });
      logAction(`Blocked user ${user.tag} (${user.id}).`);
    } else if (commandName === 'unblock') {
      const user = interaction.options.getUser('user');
      const embed = new EmbedBuilder()
        .setTitle('Unblock User')
        .setDescription(`Unblocked user ${user.tag}.`)
        .setColor(0x00ff00);
      await interaction.reply({ embeds: [embed], ephemeral: true });
      logAction(`Unblocked user ${user.tag} (${user.id}).`);
    } else if (commandName === 'status') {
      const embed = new EmbedBuilder()
        .setTitle('Bot Status')
        .setDescription('Bot is running.')
        .setColor(0x00ff00);
      await interaction.reply({ embeds: [embed], ephemeral: true });
    } else if (commandName === 'logs') {
      const logs = fs.readFileSync('logs.txt', 'utf8');
      const embed = new EmbedBuilder()
        .setTitle('Activity Logs')
        .setDescription(`Logs:\n${logs}`)
        .setColor(0x0000ff);
      await interaction.reply({ embeds: [embed], ephemeral: true });
    } else if (commandName === 'toggle') {
      const embed = new EmbedBuilder()
        .setTitle('Toggle Scanning')
        .setDescription('Toggled user scanning.')
        .setColor(0xffff00);
      await interaction.reply({ embeds: [embed], ephemeral: true });
    }
  } else if (interaction.isButton()) {
    if (interaction.customId === 'join_ticket') {
      await interaction.reply({ content: 'You have joined the ticket!', ephemeral: true });
    }
  }
});

function logAction(action) {
  const logEntry = `${new Date().toISOString()} - ${action}\n`;
  fs.appendFileSync('logs.txt', logEntry, err => {
    if (err) {
      console.error('Error logging action:', err);
    }
  });
}

function notifyAdmins(message) {
  const adminChannel = client.channels.cache.find(channel => channel.name === 'admin-notifications');
  if (adminChannel) {
    adminChannel.send(message).catch(error => {
      console.error('Error sending admin notification:', error);
    });
  }
}

client.login(token);
