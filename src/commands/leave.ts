import { joinVoiceChannel, getVoiceConnection, createAudioPlayer, createAudioResource } from '@discordjs/voice';
import Discord = require('discord.js');
import { loop, clearQueue } from './play';
export async function execute(interaction : Discord.CommandInteraction) {
    const connection = getVoiceConnection(interaction.guild.id);
    if (!connection) {
        interaction.reply({ content: 'I am not in a voice channel!', ephemeral: true });
    } else {
        connection.destroy();
        loop(0);
        clearQueue();
        interaction.reply({ content: 'Left the voice channel' })
    }
}