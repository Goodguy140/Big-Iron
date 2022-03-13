import Discord = require('discord.js')
import { TOKEN, MAIN_GUILD_ID, TEST_GUILD_ID } from './config.json';
import join = require('./commands/join');
import leave = require('./commands/leave');
import play = require('./commands/play');
import volume = require('./commands/volume');
import pause = require('./commands/pause');
import resume = require('./commands/resume');
import queue = require('./commands/queue');
const dev: boolean = true;
const approvedServers: string[] = [MAIN_GUILD_ID, TEST_GUILD_ID];
var client: Discord.Client = new Discord.Client({ intents: ['GUILDS', 'GUILD_MEMBERS', 'GUILD_MESSAGES', 'GUILD_MESSAGE_REACTIONS', 'GUILD_MESSAGE_TYPING', 'DIRECT_MESSAGES', 'DIRECT_MESSAGE_REACTIONS', 'DIRECT_MESSAGE_TYPING', 'GUILD_PRESENCES', 'GUILD_VOICE_STATES', 'GUILD_EMOJIS_AND_STICKERS'] });

client.once('ready', () => {
    console.log('Ready!');
    client.user.setActivity('Nothing', { type: 'PLAYING' });
    if (dev == true) {
        approvedServers.forEach(async (id) => {
            const guild = client.guilds.cache.get(id);
            if (guild) {
                guild.commands.set([{
                    name: 'ping',
                    description: 'Replies with pong',
                },
                {
                    name: 'play',
                    description: 'Plays a song',
                    options: [
                        {
                            name: 'song',
                            type: 'STRING' as const,
                            description: 'The search query OR url of the song to play',
                            required: true,
                        },
                    ]
                },
                {
                    name: 'join',
                    description: 'Join the voice channel that you are in',
                },
                {
                    name: 'leave',
                    description: 'Leaves the voice channel if the bot is in one',
                },
                {
                    name: 'volume',
                    description: 'Changes the volume of the bot',
                    options: [
                        {
                            name: 'volume',
                            type: 'NUMBER' as const,
                            description: 'The volume to set the bot to (0-100)',
                            required: true,
                        },
                    ]
                },
                {
                    name: 'pause',
                    description: 'Pauses the bot',
                },
                {
                    name: 'resume',
                    description: 'Resumes the bot',
                },
                {
                    name: 'loop',
                    description: 'Toggles looping',
                },
                {
                    name: 'skip',
                    description: 'Skips the current song',
                },
                {
                    name: 'queue',
                    description: 'Shows the current queue, including the current song',
                },
                ])
            }
        })
    } else {
        console.log('Not in dev mode, so no commands will be added.');
    }
});

client.on('interactionCreate', async (interaction: Discord.CommandInteraction) => {
    if (interaction.commandName === 'ping') {
        interaction.reply({ content: 'pong' });
    }
    if (interaction.commandName === 'join') {
        join.execute(interaction);
    }
    if (interaction.commandName === 'leave') {
        leave.execute(interaction);
    }
    if (interaction.commandName === 'play') {
        play.loop(0);
        play.execute(interaction, client);
    }
    if (interaction.commandName === 'volume') {
        volume.execute(interaction);
    }
    if (interaction.commandName === 'pause') {
        pause.execute(interaction);
        interaction.reply({ content: 'Should be paused lol' });
    }
    if (interaction.commandName === 'resume') {
        resume.execute(interaction);
        interaction.reply({ content: 'Should be not paused anymore :joy:' });
    }
    if (interaction.commandName === 'loop') {
        const loopage = play.loop();
        loopage.valueOf() ? interaction.reply({ content: 'Should be looping' }) : interaction.reply({ content: 'Should not be looping' });
    }
    if (interaction.commandName === 'skip') {
        interaction.reply({ content: 'Skipping...' });
        play.skip(interaction, client);
    }
    if (interaction.commandName === 'queue') {
        queue.execute(interaction);
    }
});
client.login(TOKEN);