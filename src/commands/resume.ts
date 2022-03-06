import { CommandInteraction } from "discord.js";
import { player } from "./play";

export function execute(interaction: CommandInteraction) {
    player.unpause();
}