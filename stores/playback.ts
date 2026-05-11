import { Platform } from "react-native";
import { create } from "zustand";

import { audioPlayer } from "@/lib/audio/player";
import {
  connectPlaybackWs,
  disconnectPlaybackWs,
  sendPlaybackEvent,
} from "@/lib/api/playback";
import { useAuthStore } from "@/stores/auth";
import { useSettingsStore } from "@/stores/settings";
import type { Track } from "@/lib/api/library";

type PlaybackState = {
  currentTrack: Track | null;
  isPlaying: boolean;
  positionMs: number;
  durationMs: number;
  play: (track: Track) => Promise<void>;
  pause: () => Promise<void>;
  resume: () => Promise<void>;
  seek: (ms: number) => Promise<void>;
  stop: () => Promise<void>;
};

let heartbeatInterval: ReturnType<typeof setInterval> | null = null;

function clearHeartbeat(): void {
  if (heartbeatInterval !== null) {
    clearInterval(heartbeatInterval);
    heartbeatInterval = null;
  }
}

export const usePlaybackStore = create<PlaybackState>()((set, get) => {
  // On web, expo-av pushes status updates via callback.
  // On native, PlaybackSync component syncs RNTP hook state into the store.
  if (Platform.OS === "web") {
    audioPlayer.setOnStatusUpdate((positionMs, durationMs, didFinish) => {
      set({ positionMs, durationMs });
      if (didFinish) {
        clearHeartbeat();
        set({ isPlaying: false });
      }
    });
  }

  return {
    currentTrack: null,
    isPlaying: false,
    positionMs: 0,
    durationMs: 0,

    play: async (track) => {
      const { serverUrl } = useSettingsStore.getState();
      const { accessToken } = useAuthStore.getState();

      const isWeb = Platform.OS === "web";
      const headers: Record<string, string> =
        !isWeb && accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
      const tokenParam =
        isWeb && accessToken ? `?token=${encodeURIComponent(accessToken)}` : "";
      const url = `${serverUrl}/api/stream/${track.id}${tokenParam}`;

      await audioPlayer.load(url, headers, {
        id: track.id,
        title: track.title,
        artist: track.artistName,
        album: track.albumTitle,
      });
      await audioPlayer.play();

      set({ currentTrack: track, isPlaying: true, positionMs: 0 });

      if (accessToken) {
        connectPlaybackWs(serverUrl, accessToken);
        sendPlaybackEvent({ type: "PLAY", trackId: track.id, positionMs: 0 });
        clearHeartbeat();
        heartbeatInterval = setInterval(() => {
          const { currentTrack: t, positionMs } = get();
          if (t) sendPlaybackEvent({ type: "HEARTBEAT", trackId: t.id, positionMs });
        }, 15_000);
      }
    },

    pause: async () => {
      await audioPlayer.pause();
      clearHeartbeat();
      const { currentTrack, positionMs } = get();
      if (currentTrack) {
        sendPlaybackEvent({ type: "PAUSE", trackId: currentTrack.id, positionMs });
      }
      set({ isPlaying: false });
    },

    resume: async () => {
      await audioPlayer.play();
      const { currentTrack, positionMs, isPlaying } = get();
      if (!isPlaying && currentTrack) {
        sendPlaybackEvent({ type: "PLAY", trackId: currentTrack.id, positionMs });
        clearHeartbeat();
        const { accessToken } = useAuthStore.getState();
        const { serverUrl } = useSettingsStore.getState();
        if (accessToken) connectPlaybackWs(serverUrl, accessToken);
        heartbeatInterval = setInterval(() => {
          const { currentTrack: t, positionMs: pos } = get();
          if (t) sendPlaybackEvent({ type: "HEARTBEAT", trackId: t.id, positionMs: pos });
        }, 15_000);
      }
      set({ isPlaying: true });
    },

    seek: async (ms) => {
      await audioPlayer.seek(ms);
      set({ positionMs: ms });
    },

    stop: async () => {
      clearHeartbeat();
      disconnectPlaybackWs();
      await audioPlayer.unload();
      set({ currentTrack: null, isPlaying: false, positionMs: 0, durationMs: 0 });
    },
  };
});
