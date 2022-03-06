import { joinVoiceChannel, getVoiceConnection, createAudioPlayer, createAudioResource, AudioResource, AudioPlayerStatus, AudioPlayer } from '@discordjs/voice';
import youtubeSearch = require('youtube-search');
import Discord = require('discord.js')
import { MusicSubscription } from '../subscription';
import { Client, Snowflake, VoiceChannel } from 'discord.js';
import ytdl = require('ytdl-core');
import { sleep } from '../sleep';
import { createYTStream } from '../ytstream';
export const player: AudioPlayer = createAudioPlayer();
export let resource: AudioResource;
const ytdldownloadoptions: ytdl.downloadOptions = { quality: 'highestaudio', filter: 'audioonly', };
let looping: boolean = false;
let ytdlinfo: ytdl.videoInfo;
let queueLocked: boolean = false;
let queue: string[] = [];
var opts = {
    maxResults: 1,
    key: "AIzaSyDsIdgk3X0MP_1iYZFOyExaSUaJDPMV2-Q"
}
export async function execute(interaction, client: Client) {
    const subscriptions = new Map<Snowflake, MusicSubscription>();
    let subscription = subscriptions.get(interaction.guildId);
    const channel = interaction.member.voice.channel;
    if (!channel) {
        interaction.reply({ content: 'You are not in a voice channel!', ephemeral: true });
        return;
    }
    try {
        if (looping === false) { await interaction.deferReply(); }
        if (queue.length <= 0) {
            subscription = new MusicSubscription(joinVoiceChannel({
                channelId: channel.id,
                guildId: channel.guild.id,
                adapterCreator: channel.guild.voiceAdapterCreator,
            }));
            if (!interaction.options.get('song')!.value!.toString().includes("http")) {
                const query = interaction.options.get('song')!.value! as string;
                await youtubeSearch(query, opts, async (err, results) => {
                    if (err) return console.log(err);
                    console.log("Got Link!: " + results[0].link)
                    const url = results[0].link;
                    queue.push(url);
                    startStream(url, channel, client).then((embed) => { interaction.editReply({ embeds: [embed] }) })
                });
            } else {
                const url = interaction.options.get('song')!.value! as string;
                queue.push(url);
                startStream(url, channel, client).then((embed) => { interaction.editReply({ embeds: [embed] }) })
            }
        } else {
            if (interaction.options.get('song')!.value!.toString().includes("http")) {
                queue.push(interaction.options.get('song')!.value!.toString());
                const ytdlinfo = await ytdl.getInfo(interaction.options.get('song')!.value!.toString());
                const embed = new Discord.MessageEmbed().setTitle(ytdlinfo.videoDetails.title).setURL(ytdlinfo.videoDetails.video_url).setColor('#0099ff').setDescription(`Now Queued!! :O :joy: Poggers!!!!\nLength: ${secondsToString(ytdlinfo.videoDetails.lengthSeconds)}`).setThumbnail(ytdlinfo.videoDetails.thumbnails[0].url).setAuthor(ytdlinfo.videoDetails.author.name, ytdlinfo.videoDetails.author.thumbnails[0].url, ytdlinfo.videoDetails.author.channel_url);
                interaction.editReply({ embeds: [embed] });
            } else {
                const query = interaction.options.get('song')!.value! as string;
                await youtubeSearch(query, opts, async (err, results) => {
                    if (err) return console.log(err);
                    console.log("Got Link!: " + results[0].link)
                    console.log(queue.push(results[0].link))
                    const ytdlinfo = await ytdl.getInfo(results[0].link);
                    const embed = new Discord.MessageEmbed().setTitle(ytdlinfo.videoDetails.title).setURL(ytdlinfo.videoDetails.video_url).setColor('#0099ff').setDescription(`Now Queued!! :O :joy: Poggers!!!!\nLength: ${secondsToString(ytdlinfo.videoDetails.lengthSeconds)}`).setThumbnail(ytdlinfo.videoDetails.thumbnails[0].url).setAuthor(ytdlinfo.videoDetails.author.name, ytdlinfo.videoDetails.author.thumbnails[0].url, ytdlinfo.videoDetails.author.channel_url);
                    interaction.editReply({ embeds: [embed] });
                });
            }
        }
        player.setMaxListeners(1);
        player.on(AudioPlayerStatus.Idle, () => {
            if (queueLocked === false) {
                queueLocked = true;
                if (looping == true) {
                    console.log('looping');
                    sleep(250).then(() => {
                        queue.push();
                        execute(interaction, client)
                        queueLocked = false;
                    });
                } else {
                    if (queue.length > 1) {
                        console.log("Queue: " + queue)
                        queue.shift();
                        const url = queue[0];
                        startStream(url, channel, client).then((embed) => {  })
                    } else {
                        console.log("queue is empty")
                        queue = [];
                        client.user.setActivity('your mom', { type: 'COMPETING' });
                        queueLocked = false;
                        player.removeAllListeners();
                    }
                }
            }
        });
    } catch (error) {
        if (error) console.error(error);
        interaction.followUp({ content: 'There was an error at somepoint lol', ephemeral: true });
    }
}
// Misc Functions
export function skip(interaction, client: Client): void {
    if (queue.length > 1) {
        if (queueLocked === false) {
            queue.shift();
            const url = queue[0];
            const channel = interaction.member.voice.channel;
            startStream(url, channel, client).then((embed) => { interaction.editReply('Skipped!') })
        } else {
            interaction.reply({ content: 'Queue is locked!', ephemeral: true });
        }
    }
}
export function loop(looperage: number = 2): boolean {
    if (looperage == 0) {
        looping = false;
        return false;
    } else if (looperage == 1) {
        looping = true;
        return true;
    } else if (looperage == 2) {
        if (looping == false) {
            looping = true;
            return true;
        } else {
            looping = false;
            return false;
        }
    }
}
export function clearQueue() {
    queue = [];
}
async function startStream(url: string, channel: Discord.VoiceChannel, client: Client): Promise<Discord.MessageEmbed> {
    ytdlinfo = await ytdl.getInfo(url);
    const ytdlformat: ytdl.videoFormat = ytdlinfo.formats.find(format => format.container === 'mp4');
    const stream = createYTStream(ytdlinfo, ytdlformat, ytdldownloadoptions);
    resource = createAudioResource(stream, { inlineVolume: true });
    const connection = getVoiceConnection(channel.guild.id);
    player.play(resource);
    connection.subscribe(player);
    client.user.setActivity(`${ytdlinfo.videoDetails.title}`, { type: 'LISTENING' });
    queueLocked = false;
    const embed = new Discord.MessageEmbed().setTitle(ytdlinfo.videoDetails.title).setURL(ytdlinfo.videoDetails.video_url).setColor('#0099ff').setDescription(`Now Playing!! :joy: Poggers!!!!\nLength: ${secondsToString(ytdlinfo.videoDetails.lengthSeconds)}`).setThumbnail(ytdlinfo.videoDetails.thumbnails[0].url).setAuthor(ytdlinfo.videoDetails.author.name, ytdlinfo.videoDetails.author.thumbnails[0].url, ytdlinfo.videoDetails.author.channel_url);
    return embed;
}
function secondsToString(seconds) {
    var numhours = Math.floor(((seconds % 31536000) % 86400) / 3600);
    var numminutes = Math.floor((((seconds % 31536000) % 86400) % 3600) / 60);
    var numseconds = (((seconds % 31536000) % 86400) % 3600) % 60;
    return numhours + "h " + numminutes + "m " + numseconds + "s";
}