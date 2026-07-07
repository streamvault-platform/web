import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

function generateDeviceId(): string {
  return `watch-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

type SyncStatusState = {
  // Stable per-install id standing in for the paired watch until watchOS
  // implements its own device registration/pairing handshake.
  deviceId: string;
  synced: Record<string, true>;
  syncing: Record<string, true>;
  markSyncing: (trackIds: string[]) => void;
  markSynced: (trackIds: string[]) => void;
};

export const useSyncStatusStore = create<SyncStatusState>()(
  persist(
    (set) => ({
      deviceId: generateDeviceId(),
      synced: {},
      syncing: {},

      markSyncing: (trackIds) =>
        set((s) => ({
          syncing: { ...s.syncing, ...Object.fromEntries(trackIds.map((id) => [id, true as const])) },
        })),

      markSynced: (trackIds) =>
        set((s) => {
          const syncing = { ...s.syncing };
          trackIds.forEach((id) => delete syncing[id]);
          return {
            syncing,
            synced: { ...s.synced, ...Object.fromEntries(trackIds.map((id) => [id, true as const])) },
          };
        }),
    }),
    {
      name: "streamvault-watch-sync-status",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({ deviceId: s.deviceId, synced: s.synced }),
    }
  )
);
