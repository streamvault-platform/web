import { useEffect } from "react";
import { useIsPlaying, useProgress, usePlaybackState, PlaybackState } from "@rntp/player";

import { usePlaybackStore } from "@/stores/playback";

// Bridges @rntp/player hook state into the Zustand playback store.
// Mounted once in _layout.tsx so it is always active during the session.
export function PlaybackSync() {
  const isPlaying = useIsPlaying();
  const { position, duration } = useProgress(0.25);
  const playbackState = usePlaybackState();
  const stop = usePlaybackStore((s) => s.stop);

  useEffect(() => {
    usePlaybackStore.setState({
      isPlaying,
      positionMs: Math.round(position * 1000),
      durationMs: Math.round(duration * 1000),
    });
  }, [isPlaying, position, duration]);

  useEffect(() => {
    if (playbackState === PlaybackState.Ended) {
      stop();
    }
  }, [playbackState, stop]);

  return null;
}
