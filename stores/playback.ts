import AsyncStorage from "@react-native-async-storage/async-storage";
import { File } from "expo-file-system";
import { Platform } from "react-native";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { audioPlayer } from "@/lib/audio/player";
import {
  connectPlaybackWs,
  disconnectPlaybackWs,
  fetchPlaybackState,
  sendPlaybackEvent,
} from "@/lib/api/playback";
import { getTrack } from "@/lib/api/library";
import { useAuthStore } from "@/stores/auth";
import { useDownloadsStore } from "@/stores/downloads";
import { useQueueStore } from "@/stores/queue";
import { useSettingsStore } from "@/stores/settings";
import type { Track } from "@/lib/api/library";

type PlaybackState = {
  currentTrack: Track | null;
  lastTrack: Track | null;
  isPlaying: boolean;
  positionMs: number;
  durationMs: number;
  play: (track: Track) => Promise<void>;
  playQueue: (tracks: Track[], startIndex: number) => Promise<void>;
  pause: () => Promise<void>;
  resume: () => Promise<void>;
  seek: (ms: number) => Promise<void>;
  stop: () => Promise<void>;
  next: () => Promise<void>;
  previous: () => Promise<void>;
  restoreFromServer: () => Promise<void>;
};

let heartbeatInterval: ReturnType<typeof setInterval> | null = null;

function clearHeartbeat(): void {
  if (heartbeatInterval !== null) {
    clearInterval(heartbeatInterval);
    heartbeatInterval = null;
  }
}

async function executePlay(
  track: Track,
  get: () => PlaybackState,
  set: (partial: Partial<PlaybackState>) => void
): Promise<void> {
  const { serverUrl } = useSettingsStore.getState();
  const { accessToken } = useAuthStore.getState();
  const { downloaded } = useDownloadsStore.getState();

  const isWeb = Platform.OS === "web";
  const localEntry = !isWeb ? downloaded[track.id] : undefined;

  let url: string;
  let headers: Record<string, string> = {};

  if (localEntry && new File(localEntry.localPath).exists) {
    url = localEntry.localPath;
  } else {
    if (localEntry) useDownloadsStore.getState().remove(track.id);
    const tokenParam = isWeb && accessToken ? `?token=${encodeURIComponent(accessToken)}` : "";
    url = `${serverUrl}/api/stream/${track.id}${tokenParam}`;
    if (!isWeb && accessToken) headers = { Authorization: `Bearer ${accessToken}` };
  }

  await audioPlayer.load(url, headers, {
    id: track.id,
    title: track.title,
    artist: track.artistName,
    album: track.albumTitle,
  });
  await audioPlayer.play();

  set({ currentTrack: track, lastTrack: track, isPlaying: true, positionMs: 0 });

  if (Platform.OS === "web" && "mediaSession" in navigator) {
    navigator.mediaSession.metadata = new MediaMetadata({
      title: track.title,
      artist: track.artistName ?? undefined,
      album: track.albumTitle ?? undefined,
    });
    navigator.mediaSession.setActionHandler("nexttrack", () => usePlaybackStore.getState().next());
    navigator.mediaSession.setActionHandler("previoustrack", () => usePlaybackStore.getState().previous());
    navigator.mediaSession.setActionHandler("pause", () => usePlaybackStore.getState().pause());
    navigator.mediaSession.setActionHandler("play", () => usePlaybackStore.getState().resume());
  }

  if (accessToken) {
    connectPlaybackWs(serverUrl, accessToken);
    sendPlaybackEvent({ type: "PLAY", trackId: track.id, positionMs: 0 });
    clearHeartbeat();
    heartbeatInterval = setInterval(() => {
      const { currentTrack: t, positionMs } = get();
      if (t) sendPlaybackEvent({ type: "HEARTBEAT", trackId: t.id, positionMs });
    }, 15_000);
  }
}

export const usePlaybackStore = create<PlaybackState>()(
  persist(
    (set, get) => {
      audioPlayer.setOnStatusUpdate((positionMs, durationMs, didFinish) => {
        set({ positionMs, durationMs });
        if (didFinish) {
          clearHeartbeat();
          const nextTrack = useQueueStore.getState().next();
          if (nextTrack) {
            executePlay(nextTrack, get, set);
          } else {
            set({ isPlaying: false });
          }
        }
      });

      return {
        currentTrack: null,
        lastTrack: null,
        isPlaying: false,
        positionMs: 0,
        durationMs: 0,

        play: async (track) => {
          useQueueStore.getState().setQueue([track], 0);
          await executePlay(track, get, set);
        },

        playQueue: async (tracks, startIndex) => {
          useQueueStore.getState().setQueue(tracks, startIndex);
          const track = tracks[startIndex];
          if (track) await executePlay(track, get, set);
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
          useQueueStore.getState().setQueue([], 0);
          set({ currentTrack: null, isPlaying: false, positionMs: 0, durationMs: 0 });
        },

        next: async () => {
          const nextTrack = useQueueStore.getState().next();
          if (nextTrack) await executePlay(nextTrack, get, set);
        },

        previous: async () => {
          const { positionMs } = get();
          if (positionMs > 3000) {
            await audioPlayer.seek(0);
            set({ positionMs: 0 });
            return;
          }
          const prevTrack = useQueueStore.getState().previous();
          if (prevTrack) await executePlay(prevTrack, get, set);
        },

        restoreFromServer: async () => {
          try {
            const state = await fetchPlaybackState();
            if (!state) return;
            const track = await getTrack(state.trackId);
            set({ currentTrack: track, positionMs: state.positionMs, isPlaying: false });
          } catch (e) {
            console.warn("restoreFromServer failed:", e);
          }
        },
      };
    },
    {
      name: "streamvault-playback",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({ currentTrack: s.currentTrack, lastTrack: s.lastTrack, positionMs: s.positionMs, durationMs: s.durationMs }),
      merge: (persisted, current) => ({ ...current, ...(persisted as object), isPlaying: false }),
    }
  )
);
