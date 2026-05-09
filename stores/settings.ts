import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type SettingsState = {
  serverUrl: string;
  setServerUrl: (url: string) => void;
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      serverUrl: "",
      // Strip trailing slash so callers never need to worry about double-slashes
      setServerUrl: (url) => set({ serverUrl: url.replace(/\/+$/, "") }),
    }),
    {
      name: "streamvault-settings",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
