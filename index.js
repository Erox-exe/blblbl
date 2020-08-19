const { Client, Collection, MessageEmbed, version } = require('discord.js');
const { prefix, token, serverID, roleID, interval } = require('./config.json')
const { config } = require("process", "./config.json");
const { readdirSync } = require("fs");
const DIG = require("discord-image-generation");


const bot = new Client();
["commands", "cooldowns"].forEach(x => bot[x] = new Collection());

const loadCommands = (dir = "./commands/") => {
    readdirSync(dir).forEach(dirs => {
        const commands = readdirSync(`${dir}/${dirs}/`).filter(files => files.endsWith(".js"));

        for(const file of commands) {
            const getFileName = require(`${dir}/${dirs}/${file}`);
            bot.commands.set(getFileName.help.name, getFileName);
            console.log(`CMD LOAD: ${getFileName.help.name}`);
        };
    });
};

loadCommands();

bot.queue = new Map();

bot.on('message', message => {

    if (!message.content.startsWith(prefix) || message.author.bot) return;

    const args = message.content.slice(prefix.length).split(/ +/);
    const commandName = args.shift().toLowerCase();
    console.log(args.splice(1));

    const command = bot.commands.get(commandName) || bot.commands.find(cmd => cmd.help.aliases && cmd.help.aliases.includes(commandName));
    console.log(bot.commands)
    if (!command) return;

    if (!bot.cooldowns.has(command.help.name)) {
        bot.cooldowns.set(command.help.name, new Collection());
    }

    const timeNow = Date.now();
    const tStamps = bot.cooldowns.get(command.help.name);
    const cdAmount = (command.help.cooldown || 5) * 1000;
    console.log(bot.cooldowns);

    if (tStamps.has(message.author.id)) {
        const cdExpirationTime = tStamps.get(message.author.id) + cdAmount;

        if (timeNow < cdExpirationTime) {
            timeLeft = (cdExpirationTime - timeNow) / 1000;

            const timeEmbed = new MessageEmbed()
            .setTitle("CoolDown")
            .setDescription(`Merci d'attendre ${timeLeft.toFixed(0)} secondes avant de reutiliser la commande : \`${commandName}\`.`)
            return message.reply(timeEmbed);
        }
    }

    tStamps.set(message.author.id, timeNow);
    setTimeout(() => tStamps.delete(message.author.id), cdAmount);

    command.run(bot, message, args);
});

bot.on("ready", async() => {
    console.log(`[ bot ] ${bot.user.tag} Connecté zb`);

    let guild = bot.guilds.cache.get(serverID)
    if(!guild) throw `[ Error ] Problème de serverid zbi: ${serverID}`

    let role = guild.roles.cache.find(u => u.id === roleID)
    if(!role) throw `[ Error ] Role pas trouver pour ${guild.name}`
    
    if(interval < 60000) console.log(`\n[!!!] Un soucis frr..`)

    setInterval(() => {
        role.edit({color: 'RANDOM'}).catch(err => console.log(`[ Error ] Jte ez.exe`));
    }, interval)

})

bot.login(token)