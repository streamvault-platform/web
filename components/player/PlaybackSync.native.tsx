import { useEffect } from "react";
import { Event, useIsPlaying, useProgress, usePlaybackState, PlaybackState } from "@rntp/player";

import { subscribeRntpEvent } from "@/lib/audio/rntp-events";

import { usePlaybackStore } from "@/stores/playback";
import { useQueueStore } from "@/stores/queue";

// Bridges @rntp/player hook state into the Zustand playback store.
// Mounted once in _layout.tsx so it is always active during the session.
export function PlaybackSync() {
  const isPlaying = useIsPlaying();
  const { position, duration } = useProgress(0.25);
  const playbackState = usePlaybackState();
  const next = usePlaybackStore((s) => s.next);
  const previous = usePlaybackStore((s) => s.previous);
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


  useEffect(() => {
    const nextSub = subscribeRntpEvent(Event.RemoteNext, () => { next(); });
    const prevSub = subscribeRntpEvent(Event.RemotePrevious, () => { previous(); });
    return () => {
      nextSub.remove();
      prevSub.remove();
    };
  }, [next, previous]);

  return null;
}
