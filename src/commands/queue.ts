import { CommandInteraction } from "discord.js";
import { song } from "../other/song";
import { queue } from "./play";
import { secondsToString } from "../other/util";

export function execute(interaction: CommandInteraction) {
    if(queue.length == 0) {
        interaction.reply({ content: 'Queue is empty' });
    } else if(queue.length >= 1) {
        let reply: string = "Queue: \n\n";
        let i: number = 0;
        queue.forEach((Song:song) => {
            i++;
            reply = reply.concat(`**${i}.** ${Song.title} (${secondsToString(Song.info.lengthSeconds)}) \n`);
        });
        interaction.reply({ content: reply });
    }
}