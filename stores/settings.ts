import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export const BUILT_IN_SERVER_URL: string =
  process.env.EXPO_PUBLIC_API_URL ||
  (!__DEV__ && typeof window !== "undefined" ? window.location.origin : "");

export const isServerUrlLocked = Boolean(BUILT_IN_SERVER_URL);

type SettingsState = {
  serverUrl: string;
  setServerUrl: (url: string) => void;
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      serverUrl: BUILT_IN_SERVER_URL,
      // Strip trailing slash
      setServerUrl: (url) => set({ serverUrl: url.replace(/\/+$/, "") }),
    }),
    {
      name: "streamvault-settings",
      storage: createJSONStorage(() => AsyncStorage),
      merge: (persisted, current) => {
        const merged = { ...current, ...(persisted as Partial<SettingsState>) };
        if (BUILT_IN_SERVER_URL) merged.serverUrl = BUILT_IN_SERVER_URL;
        return merged;
      },
    }
  )
);
