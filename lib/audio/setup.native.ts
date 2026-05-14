import TrackPlayer, { PlayerCommand } from "@rntp/player";

import { backgroundEventHandler } from "./trackPlayerService";

let initialized = false;

export async function setupAudioPlayer(): Promise<void> {
  if (initialized) return;
  initialized = true;

  TrackPlayer.registerBackgroundEventHandler(() => backgroundEventHandler);

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
      PlayerCommand.Next,
      PlayerCommand.Previous,
    ],
  });
}
