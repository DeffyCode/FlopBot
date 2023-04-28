const Discord = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const dotenv = require('dotenv'); require('dotenv').config();
const fs = require('fs');

const client = new Discord.Client({ intents: 3243773 });
const commands = [];

const application_id = `${process.env['CLIENT_ID']}`;
const guild_id = `${process.env['GUILD_ID']}`;
const token = `${process.env['TOKEN']}`;

const flops = {};

client.on('ready', () => {
  console.log(`✅ ${client.user.tag} est connecté!`);
  client.user.setActivity('faire flopper le serveur en appelant Grim!');

  const addFlopCommand = new SlashCommandBuilder()
    .setName('addflop')
    .setDescription('Ajoute un flop à un utilisateur.')
    .addUserOption(option => 
      option.setName('utilisateur')
      .setDescription('L\'utilisateur à qui ajouter un flop')
      .setRequired(true)
    );

  const delFlopCommand = new SlashCommandBuilder()
    .setName('delflop')
    .setDescription('Retire un flop à un utilisateur.')
    .addUserOption(option => 
      option.setName('utilisateur')
      .setDescription('L\'utilisateur à qui retirer un flop')
      .setRequired(true)
    );

  const flopsCommand = new SlashCommandBuilder()
    .setName('flops')
    .setDescription('Affiche le nombre de flops de l\'utilisateur.')
    .addUserOption(option => 
      option.setName('utilisateur')
      .setDescription('L\'utilisateur dont afficher les flops')
    );

  const leaderFlopCommand = new SlashCommandBuilder()
    .setName('leaderflop')
    .setDescription('Affiche le classement des utilisateurs avec le plus de flops.');

  const helpCommand = new SlashCommandBuilder()
    .setName('help')
    .setDescription('Affiche la liste des commandes disponibles');

  commands.push(addFlopCommand.toJSON());
  commands.push(delFlopCommand.toJSON());
  commands.push(flopsCommand.toJSON());
  commands.push(leaderFlopCommand.toJSON());

  const rest = new REST({ version: '9' }).setToken(token);

  rest.put(Routes.applicationCommands(client.user.id), { body: commands })
    .then(() => console.log('✅ Les slash commands ont bien été initialisées !'))
    .catch(console.error);
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return;

  const { commandName, options } = interaction;

  if (commandName === 'addflop') {
    const user = options.getUser('utilisateur');
    const userId = user.id;

    if (!flops[userId]) {
      flops[userId] = 1;
    } else {
      flops[userId] += 1;
    }

    fs.writeFileSync('flops.json', JSON.stringify(flops, null, 2));

    await interaction.reply(`Un flop a été ajouté à ${user.username}!`);
  } else if (commandName === 'delflop') {
    const user = options.getUser('utilisateur');
    const userId = user.id;

    if (flops[userId]) {
      flops[userId] -= 1;

      if (flops[userId] === 0) {
        delete flops[userId];
      }

      fs.writeFileSync('flops.json', JSON.stringify(flops, null, 2));

      await interaction.reply(`Un flop a été retiré à ${user.username}!`);
    } else {
      await interaction.reply(`${user.username} n'a aucun flop à retirer.`);
    }
  } else if (commandName === 'flops') {
    const user = options.getUser('utilisateur');
    const userId = user.id;

    const userFlops = flops[userId] || 0;

    await interaction.reply(`${user.username} a ${userFlops} flop(s)`);
} else if (commandName === 'leaderflop') {
let leaderBoard = '';
Object.entries(flops).sort((a, b) => b[1] - a[1]).forEach(([userId, userFlops], index) => {
    const user = client.users.cache.get(userId);
  
    leaderBoard += `${index + 1}. ${user.username}: ${userFlops} flops\n`;
  });
  
  if (leaderBoard === '') {
    leaderBoard = 'Il n\'y a aucun flop sur le serveur pour l\'instant.';
  }
  
  await interaction.reply(`Voici le classement des flops :\n${leaderBoard}`);
} else if (commandName === 'help') {
  const embed = new MessageEmbed()
      .setTitle('List of Commands')
      .setDescription('Here are the available commands:')
      .setColor('#00ff00')
      .addField('/addflop', 'Adds a flop to your flops count')
      .addField('/delflop', 'Removes a flop from your flops count')
      .addField('/flops', 'Displays the number of flops you have')
      .addField('/leaderflop', 'Displays the leaderboard of the top 10 users with the most flops');
    interaction.reply({ embeds: [embed] });
}
});

client.login(token);