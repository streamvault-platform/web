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
      PlayerCommand.Next,
      PlayerCommand.Previous,
    ],
    // Route remote control events to JS so our Zustand queue handles them.
    // Default ('native') would let RNTP's internal queue handle Next/Previous,
    // which doesn't know about our queue.
    handling: "js",
  });
}
