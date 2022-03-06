import { joinVoiceChannel, getVoiceConnection, createAudioPlayer, createAudioResource } from '@discordjs/voice';
export function execute(interaction) {
    const channel = interaction.member.voice.channel;
    if (!channel) {
        interaction.reply({ content: 'You are not in a voice channel!', ephemeral: true });
        return;
    }
    try {
        joinVoiceChannel({
            channelId: channel.id,
            guildId: channel.guild.id,
            adapterCreator: channel.guild.voiceAdapterCreator,
            selfDeaf: true,
        });
        interaction.reply({ content: 'Joined the voice channel!' });
    } catch (error) {
        if (error) console.error(error);
        interaction.reply({ content: 'There was an error while joining the voice channel!', ephemeral: true });
    }
}