import { CommandInteraction } from "discord.js";
import { resource } from "./play";

export function execute(interaction: CommandInteraction) {
    const vol = interaction.options.get('volume')!.value! as number/100;
    resource.volume.setVolume(vol);
    if(vol > 1) {
        interaction.reply({ content: 'Please Be Advised that volume above 100 may cause baseboostage \nSet Volume to: ' + vol*100 + '%' });
    } else {
        interaction.reply({ content: 'Volume set to ' + interaction.options.get('volume')!.value! + '%' });
    }
}