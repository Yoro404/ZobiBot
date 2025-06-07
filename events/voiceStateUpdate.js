import { joinVoiceChannel, entersState, VoiceConnectionStatus, createAudioPlayer, createAudioResource, AudioPlayerStatus } from '@discordjs/voice';
import { useMainPlayer } from 'discord-player';
import path from 'path';

const userMusicMap = {
  "123456789012345678": path.resolve('assets/sound1.mp3'),
  "234567890123456789": path.resolve('assets/sound2.mp3'),
};

export default async (client, oldState, newState) => {
  const member = newState.member || oldState.member;
  if (!member || member.user.bot) return;

  const player = useMainPlayer();
  const guildId = member.guild.id;
  const queue = player.nodes.get(guildId);
  if (queue && queue.node.isPlaying()) return;

  const joinedChannel = newState.channel;
  if (joinedChannel && userMusicMap[member.id]) {
    const connection = joinVoiceChannel({
      channelId: joinedChannel.id,
      guildId: joinedChannel.guild.id,
      adapterCreator: joinedChannel.guild.voiceAdapterCreator,
      selfDeaf: false
    });
    try {
      await entersState(connection, VoiceConnectionStatus.Ready, 5_000);
      const audioPlayer = createAudioPlayer();
      const resource = createAudioResource(userMusicMap[member.id], { inlineVolume: true });
      resource.volume.setVolume(0.10);
      audioPlayer.play(resource);
      connection.subscribe(audioPlayer);
      audioPlayer.on(AudioPlayerStatus.Idle, () => {
        connection.destroy();
      });
    } catch (e) {
      connection.destroy();
    }
  }
};
