import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { UserLibraryTrack } from "@/lib/api/library";

type LibraryState = {
  myTracks: UserLibraryTrack[];
  setMyTracks: (tracks: UserLibraryTrack[]) => void;
};

export const useLibraryStore = create<LibraryState>()(
  persist(
    (set) => ({
      myTracks: [],
      setMyTracks: (tracks) => set({ myTracks: tracks }),
    }),
    {
      name: "streamvault-library",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
