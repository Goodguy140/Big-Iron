import youtubeSearch = require('youtube-search');
import ytdl = require('ytdl-core');
import Discord = require('discord.js')
import { joinVoiceChannel, getVoiceConnection, createAudioPlayer, createAudioResource, AudioResource, AudioPlayerStatus, AudioPlayer } from '@discordjs/voice';
import { MusicSubscription } from '../other/subscription';
import { Client, Snowflake } from 'discord.js';
import { publishedDatetoDate, secondsToString, sleep, makeEmbed } from '../other/util';
import { createYTStream } from '../other/ytstream';
import { song } from '../other/song';
const COOKIE = 'VISITOR_INFO1_LIVE=lBXSZk2hmO4; PREF=f4=4000000&tz=America.Halifax&f6=40000000; LD_S=true; _ga=GA1.2.143511903.1635530783; ajs_anonymous_id=eb120671-abe9-47c3-a5f2-94fbdadfbf04; ajs_user_id=5b2d3f5054b8a414f1000002; LD_T=4997e84a-c21e-4040-cf7e-be2382640b30; _gcl_au=1.1.246772812.1644454948; HSID=ATuI8Pi-BsncSJfoT; SSID=AjFHN8lie-dxgsxfj; APISID=tlEVQG0EBrKMV5PU/A7bJOgZBCViuF4e3b; SAPISID=LeOreo77y_oJeont/ADJrQMD_gIe8Ugwdm; __Secure-1PAPISID=LeOreo77y_oJeont/ADJrQMD_gIe8Ugwdm; __Secure-3PAPISID=LeOreo77y_oJeont/ADJrQMD_gIe8Ugwdm; SID=HghRX_3vz-ohT0lrspzM0P7dGo1vaMD-V6EwBlWW3nxOcFVKoWOUgNwrmMP6Q80vA1NK8g.; __Secure-1PSID=HghRX_3vz-ohT0lrspzM0P7dGo1vaMD-V6EwBlWW3nxOcFVKXeu0HV-DC7cUp9hD_kgYnw.; __Secure-3PSID=HghRX_3vz-ohT0lrspzM0P7dGo1vaMD-V6EwBlWW3nxOcFVKF1J8u3MkwYv8IIZNkjs8mw.; LOGIN_INFO=AFmmF2swRgIhAOj9cr3hn0vNMF4c0J_A2X9tYVE75SliGyCqcSXm-FOaAiEA9vlLSaMNklkRaEoaLrioFi3WbsYCyG0LeU95wFUpjTk:QUQ3MjNmeU1tU291Wk5nSmJjNmcyQ3FYaFhQWmhLZ3JLQzRicHVkWVRTOG1NUEFaXzlySV9wY2ZFNllRTlNRdjhZTFlEWFpWd2I1VGZUQ0ZHSDlaWHgtYXV4UWZVUnFHRWhNY0RkUlVaNDkzbXhyOF93ME1tTUtUR0VVUE1JdndHbHh2akY5UzN5M0J6N1NBMm5lcDRIdk8yN1hpeDJEZVhR; YSC=Slhlvz2ekz4; _gid=GA1.2.194522517.1646694660; amplitude_id_bc73d2c89ab647ec4aa1a2d38de9a951youtube.com=eyJkZXZpY2VJZCI6IjY0NzI2YTdiLTllMmUtNGUxYy05Mzk4LTc4YTk3YTFlMmVmMFIiLCJ1c2VySWQiOiI1YjJkM2Y1MDU0YjhhNDE0ZjEwMDAwMDIiLCJvcHRPdXQiOmZhbHNlLCJzZXNzaW9uSWQiOjE2NDY2OTQ2NTk2OTAsImxhc3RFdmVudFRpbWUiOjE2NDY2OTUyNjg1MjgsImV2ZW50SWQiOjAsImlkZW50aWZ5SWQiOjIxLCJzZXF1ZW5jZU51bWJlciI6MjF9; amplitude_id_765ed530d0f6d48769c02ff01529d23a_devyoutube.com=eyJkZXZpY2VJZCI6IjY4ZDA3M2RlLWRjZDEtNDhmZC1iZWNmLTI5YTk4ZTU2ZDM0OFIiLCJ1c2VySWQiOiI1YjJkM2Y1MDU0YjhhNDE0ZjEwMDAwMDIiLCJvcHRPdXQiOmZhbHNlLCJzZXNzaW9uSWQiOjE2NDY2OTQ2NTk3MDksImxhc3RFdmVudFRpbWUiOjE2NDY2OTUyNjg1NDAsImV2ZW50SWQiOjAsImlkZW50aWZ5SWQiOjIxLCJzZXF1ZW5jZU51bWJlciI6MjF9; SIDCC=AJi4QfHnBjVO0twZvgcs5Su6wGehGZUZm1kviyeAIHggkDwa0DD9PKQZKsdgJ0cylmkHpMHKkmQ; __Secure-3PSIDCC=AJi4QfHgjPXPNgz1O3TQeEONS6b9YVWhWT33HHaFw8zT6ZiOK8pOuobUmZ37jBLAX6NVSgVFUew';
export const player: AudioPlayer = createAudioPlayer();
export let resource: AudioResource;
const ytdldownloadoptions: ytdl.downloadOptions = { quality: 'highestaudio', filter: 'audioonly', requestOptions: { headers: { cookie: COOKIE, } } };
const ytdlcookie: ytdl.downloadOptions = { requestOptions: { headers: { cookie: COOKIE, }, } }
let looping: boolean = false;
let ytdlinfo: ytdl.videoInfo;
let queueLocked: boolean = false;
export let queue: song[] = [];
var opts = { maxResults: 1, key: "AIzaSyDsIdgk3X0MP_1iYZFOyExaSUaJDPMV2-Q" };
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
                    const url = results[0].link;
                    const videoDetails: ytdl.MoreVideoDetails = (await ytdl.getInfo(url, ytdlcookie)).videoDetails
                    const song:song = { url: videoDetails.video_url, title: videoDetails.title, info: videoDetails }
                    console.log("Got Link & Info (title)!: " + videoDetails.title)
                    queue.push(song);
                    startStream(song, channel, client).then((embed) => { interaction.editReply({ embeds: [embed] }) })
                });
            } else {
                const url = interaction.options.get('song')!.value! as string;
                const videoDetails: ytdl.MoreVideoDetails = (await ytdl.getInfo(url, ytdlcookie)).videoDetails
                const song:song = { url: videoDetails.video_url, title: videoDetails.title, info: videoDetails }
                queue.push(song);
                startStream(song, channel, client).then((embed) => { interaction.editReply({ embeds: [embed] }) })
            }
        } else {
            if (interaction.options.get('song')!.value!.toString().includes("http")) {
                queue.push(interaction.options.get('song')!.value!.toString());
                const ytdlinfo = await ytdl.getInfo(interaction.options.get('song')!.value!.toString(), ytdlcookie);
                const publishedAt = publishedDatetoDate(ytdlinfo.videoDetails.publishDate);
                const embed = new Discord.MessageEmbed().setTitle(ytdlinfo.videoDetails.title).setURL(ytdlinfo.videoDetails.video_url).setColor('#0099ff').setDescription(`Now Queued!! :joy: Poggers!!!! :arrow_forward:`).setThumbnail(ytdlinfo.videoDetails.thumbnails[0].url).setAuthor(ytdlinfo.videoDetails.author.name, ytdlinfo.videoDetails.author.thumbnails[0].url, ytdlinfo.videoDetails.author.channel_url).setTimestamp(publishedAt).addField('Length', secondsToString(ytdlinfo.videoDetails.lengthSeconds), true).addField('Views', Number.parseInt(ytdlinfo.videoDetails.viewCount).toLocaleString('en-US'), true)
                interaction.editReply({ embeds: [embed] });
            } else {
                const query = interaction.options.get('song')!.value! as string;
                await youtubeSearch(query, opts, async (err, results) => {
                    if (err) return console.log(err);
                    const videoInfo = ytdl.getInfo(results[0].link, ytdlcookie);
                    const videoDetails = (await videoInfo).videoDetails;
                    queue.push({ url: videoDetails.video_url, title: videoDetails.title, info: videoDetails });
                    const publishedAt = publishedDatetoDate(videoDetails.publishDate);
                    const embed = new Discord.MessageEmbed().setTitle(videoDetails.title).setURL(videoDetails.video_url).setColor('#0099ff').setDescription(`Now Queued!! :joy: Poggers!!!! :arrow_forward:`).setThumbnail(videoDetails.thumbnails[0].url).setAuthor(videoDetails.author.name, videoDetails.author.thumbnails[0].url, videoDetails.author.channel_url).setTimestamp(publishedAt).addField('Length', secondsToString(videoDetails.lengthSeconds), true).addField('Views', Number.parseInt(videoDetails.viewCount).toLocaleString('en-US'), true)
                    console.log("Got Link & Info (title)!: " + videoDetails.title)
                    console.log(queue.push())
                    interaction.editReply({ embeds: [embed] });
                });
            }
        }
        player.setMaxListeners(2);
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
                        queue.forEach((Song:song) => {
                            console.log("Queue: " + Song.title);
                        });
                        queue.shift();
                        const song = queue[0];
                        startStream(song, channel, client).then((embed) => { })
                    } else {
                        console.log("queue is empty")
                        queue = [];
                        client.user.setActivity('Nothing', { type: 'PLAYING' });
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

async function startStream(song: song, channel: Discord.VoiceChannel, client: Client): Promise<Discord.MessageEmbed> {
    const ytdlinfo = await ytdl.getInfo(song.url, ytdlcookie);
    const ytdlformat: ytdl.videoFormat = ytdlinfo.formats.find(format => format.container === 'mp4');
    const stream = createYTStream(ytdlinfo, ytdlformat, ytdldownloadoptions);
    const connection = getVoiceConnection(channel.guild.id);
    resource = createAudioResource(stream, { inlineVolume: true });
    player.play(resource);
    connection.subscribe(player);
    client.user.setActivity(`${ytdlinfo.videoDetails.title}`, { type: 'LISTENING' });
    queueLocked = false;
    return makeEmbed(ytdlinfo);
}

// Misc Functions
export function clearQueue() {
    queue = [];
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
export function skip(interaction, client: Client): void {
    if (queue.length > 1) {
        if (queueLocked === false) {
            queue.shift();
            const song = queue[0];
            const channel = interaction.member.voice.channel;
            startStream(song, channel, client).then((embed) => { interaction.editReply('Skipped!') })
        } else {
            interaction.reply({ content: 'Queue is locked!', ephemeral: true });
        }
    }
}