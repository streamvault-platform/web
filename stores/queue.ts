import { create } from "zustand";

import type { Track } from "@/lib/api/library";

type QueueState = {
  tracks: Track[];
  currentIndex: number;
  currentTrack: Track | null;
  hasNext: boolean;
  hasPrevious: boolean;
  setQueue: (tracks: Track[], startIndex: number) => void;
  playNext: (track: Track) => void;
  addToQueue: (track: Track) => void;
  next: () => Track | null;
  previous: () => Track | null;
};

function derive(tracks: Track[], index: number) {
  return {
    currentTrack: tracks[index] ?? null,
    hasNext: index < tracks.length - 1,
    hasPrevious: index > 0,
  };
}

export const useQueueStore = create<QueueState>()((set, get) => ({
  tracks: [],
  currentIndex: 0,
  currentTrack: null,
  hasNext: false,
  hasPrevious: false,

  setQueue: (tracks, startIndex) => {
    set({ tracks, currentIndex: startIndex, ...derive(tracks, startIndex) });
  },

  playNext: (track) => {
    const { tracks, currentIndex } = get();
    const insertAt = currentIndex + 1;
    const newTracks = [...tracks.slice(0, insertAt), track, ...tracks.slice(insertAt)];
    set({ tracks: newTracks, ...derive(newTracks, currentIndex) });
  },

  addToQueue: (track) => {
    const { tracks, currentIndex } = get();
    const newTracks = [...tracks, track];
    set({ tracks: newTracks, ...derive(newTracks, currentIndex) });
  },

  next: () => {
    const { tracks, currentIndex } = get();
    if (currentIndex >= tracks.length - 1) return null;
    const nextIndex = currentIndex + 1;
    set({ currentIndex: nextIndex, ...derive(tracks, nextIndex) });
    return tracks[nextIndex];
  },

  previous: () => {
    const { tracks, currentIndex } = get();
    if (currentIndex <= 0) return null;
    const prevIndex = currentIndex - 1;
    set({ currentIndex: prevIndex, ...derive(tracks, prevIndex) });
    return tracks[prevIndex];
  },
}));
