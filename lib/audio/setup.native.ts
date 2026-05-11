import TrackPlayer, { PlayerCommand } from "@rntp/player";

let initialized = false;

export async function setupAudioPlayer(): Promise<void> {
  if (initialized) return;
  initialized = true;

  TrackPlayer.setupPlayer({
    contentType: "music",
    handleAudioBecomingNoisy: true,
    android: { wakeMode: "network" },
  });

  TrackPlayer.setCommands({
    capabilities: [
      PlayerCommand.PlayPause,
      PlayerCommand.Seek,
      PlayerCommand.Stop,
    ],
  });
}
