import { create } from "zustand";
import { sendConfigToWatch, type WatchConfig } from "@/modules/watch-bridge";

type WatchSyncState = {
  lastSyncedAt: number | null;
  sendConfig: (config: WatchConfig) => Promise<void>;
};

export const useWatchSyncStore = create<WatchSyncState>()((set) => ({
  lastSyncedAt: null,

  sendConfig: async (config) => {
    await sendConfigToWatch(config);
    set({ lastSyncedAt: Date.now() });
  },
}));
