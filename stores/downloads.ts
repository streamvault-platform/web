import AsyncStorage from "@react-native-async-storage/async-storage";
import { Directory, File, Paths } from "expo-file-system";
import { Platform } from "react-native";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { Track } from "@/lib/api/library";
import { useAuthStore } from "@/stores/auth";
import { useSettingsStore } from "@/stores/settings";

export type DownloadEntry = {
  localPath: string;
  downloadedAt: number;
  fileSizeBytes: number;
  title: string;
};

type DownloadsState = {
  downloaded: Record<string, DownloadEntry>;
  pending: Record<string, boolean>;
  download: (track: Track) => Promise<void>;
  remove: (trackId: string) => void;
  totalBytes: () => number;
  clearAll: () => void;
};

function getDownloadsDir(): Directory {
  return new Directory(Paths.document, "sv-downloads");
}

function mimeToExt(mimeType: string): string {
  if (mimeType.includes("flac")) return ".flac";
  if (mimeType.includes("ogg")) return ".ogg";
  if (mimeType.includes("aac") || mimeType.includes("m4a")) return ".m4a";
  return ".mp3";
}

export const useDownloadsStore = create<DownloadsState>()(
  persist(
    (set, get) => ({
      downloaded: {},
      pending: {},

      download: async (track) => {
        if (Platform.OS === "web") return;
        if (get().downloaded[track.id] || get().pending[track.id]) return;

        const { accessToken } = useAuthStore.getState();
        const { serverUrl } = useSettingsStore.getState();
        if (!accessToken) return;

        set((s) => ({ pending: { ...s.pending, [track.id]: true } }));

        try {
          const dir = getDownloadsDir();
          dir.create({ idempotent: true });

          const destination = new File(dir, track.id + mimeToExt(track.mimeType ?? ""));
          const url = `${serverUrl}/api/stream/${track.id}?token=${encodeURIComponent(accessToken)}`;

          const downloaded = await File.downloadFileAsync(url, destination, { idempotent: true });

          set((s) => ({
            downloaded: {
              ...s.downloaded,
              [track.id]: {
                localPath: downloaded.uri,
                downloadedAt: Date.now(),
                fileSizeBytes: downloaded.size,
                title: track.title,
              },
            },
            pending: Object.fromEntries(Object.entries(s.pending).filter(([k]) => k !== track.id)),
          }));
        } catch (e) {
          console.warn("Download failed:", e);
          set((s) => ({
            pending: Object.fromEntries(Object.entries(s.pending).filter(([k]) => k !== track.id)),
          }));
        }
      },

      remove: (trackId) => {
        const entry = get().downloaded[trackId];
        if (!entry) return;
        const file = new File(entry.localPath);
        if (file.exists) file.delete();
        set((s) => {
          const { [trackId]: _, ...rest } = s.downloaded;
          return { downloaded: rest };
        });
      },

      totalBytes: () =>
        Object.values(get().downloaded).reduce((sum, e) => sum + e.fileSizeBytes, 0),

      clearAll: () => {
        const dir = getDownloadsDir();
        if (dir.exists) dir.delete();
        set({ downloaded: {} });
      },
    }),
    {
      name: "streamvault-downloads",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({ downloaded: s.downloaded }),
    }
  )
);
