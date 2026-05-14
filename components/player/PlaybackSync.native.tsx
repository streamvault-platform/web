import { useEffect } from "react";
import { useIsPlaying, useProgress, usePlaybackState, PlaybackState } from "@rntp/player";

import { usePlaybackStore } from "@/stores/playback";
import { useQueueStore } from "@/stores/queue";

// Bridges @rntp/player hook state into the Zustand playback store.
// Mounted once in _layout.tsx so it is always active during the session.
export function PlaybackSync() {
  const isPlaying = useIsPlaying();
  const { position, duration } = useProgress(0.25);
  const playbackState = usePlaybackState();
  const next = usePlaybackStore((s) => s.next);
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
      if (useQueueStore.getState().hasNext) {
        next();
      } else {
        stop();
      }
    }
  }, [playbackState, next, stop]);

  return null;
}
