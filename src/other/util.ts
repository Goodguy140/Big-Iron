import { MessageEmbed } from "discord.js";
import { videoInfo } from "ytdl-core";

export function secondsToString(seconds: string | number): string {
    var sec_num = parseInt(seconds as string, 10);
    var numhours = Math.floor(((sec_num % 31536000) % 86400) / 3600);
    var numminutes = Math.floor((((sec_num % 31536000) % 86400) % 3600) / 60);
    var numseconds = (((sec_num % 31536000) % 86400) % 3600) % 60;
    return numhours + "h " + numminutes + "m " + numseconds + "s";
}
export function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
export function publishedDatetoDate(date: string): Date {
    const dateObj = new Date(date.replace(/-/g, '\/'));
    return dateObj;
}
export function makeEmbed(ytdlinfo: videoInfo): MessageEmbed {
    const embed = new MessageEmbed();
    embed.setTitle(ytdlinfo.videoDetails.title).setURL(ytdlinfo.videoDetails.video_url)
    .setColor('#0099ff').setDescription(`Now Playing!! :joy: Poggers!!!! :white_check_mark: :play_pause:`)
    .setThumbnail(ytdlinfo.videoDetails.thumbnails[0].url).setAuthor(ytdlinfo.videoDetails.author.name, ytdlinfo.videoDetails.author.thumbnails[0].url, ytdlinfo.videoDetails.author.channel_url)
    .setTimestamp(publishedDatetoDate(ytdlinfo.videoDetails.publishDate)).addField('Length', secondsToString(ytdlinfo.videoDetails.lengthSeconds), true)
    .addField('Views', Number.parseInt(ytdlinfo.videoDetails.viewCount).toLocaleString('en-US'), true)
    return embed;
}