import { beforeEach, describe, expect, it } from "vitest";
import type { Track } from "@/lib/api/library";

const { useQueueStore } = await import("./queue");

// ─── Fixtures ─────────────────────────────────────────────────────────────────

function makeTrack(id: string, title = `Track ${id}`): Track {
  return {
    id,
    title,
    filePath: `/originals/${id}.mp3`,
    artistId: "a1",
    artistName: "Artist",
    albumId: "alb1",
    albumTitle: "Album",
    trackNumber: Number(id),
    discNumber: null,
    durationMs: 180_000,
    genre: "Rock",
    year: 2024,
    mimeType: "audio/mpeg",
  };
}

const t1 = makeTrack("1");
const t2 = makeTrack("2");
const t3 = makeTrack("3");
const t4 = makeTrack("4");
const t5 = makeTrack("5");

// ─── Helpers ──────────────────────────────────────────────────────────────────

function resetStore() {
  useQueueStore.setState({
    tracks: [],
    currentIndex: 0,
    currentTrack: null,
    hasNext: false,
    hasPrevious: false,
  });
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("useQueueStore", () => {
  beforeEach(resetStore);

  // ── Initial state ────────────────────────────────────────────────────────

  it("starts empty", () => {
    const { tracks, currentIndex, currentTrack, hasNext, hasPrevious } =
      useQueueStore.getState();
    expect(tracks).toHaveLength(0);
    expect(currentIndex).toBe(0);
    expect(currentTrack).toBeNull();
    expect(hasNext).toBe(false);
    expect(hasPrevious).toBe(false);
  });

  // ── setQueue ─────────────────────────────────────────────────────────────

  describe("setQueue()", () => {
    it("sets tracks and jumps to startIndex", () => {
      useQueueStore.getState().setQueue([t1, t2, t3], 1);
      const state = useQueueStore.getState();
      expect(state.tracks).toEqual([t1, t2, t3]);
      expect(state.currentIndex).toBe(1);
      expect(state.currentTrack).toEqual(t2);
    });

    it("derives hasNext correctly", () => {
      useQueueStore.getState().setQueue([t1, t2, t3], 1);
      expect(useQueueStore.getState().hasNext).toBe(true);

      useQueueStore.getState().setQueue([t1, t2, t3], 2);
      expect(useQueueStore.getState().hasNext).toBe(false);
    });

    it("derives hasPrevious correctly", () => {
      useQueueStore.getState().setQueue([t1, t2, t3], 1);
      expect(useQueueStore.getState().hasPrevious).toBe(true);

      useQueueStore.getState().setQueue([t1, t2, t3], 0);
      expect(useQueueStore.getState().hasPrevious).toBe(false);
    });

    it("handles single-track queue at index 0", () => {
      useQueueStore.getState().setQueue([t1], 0);
      const state = useQueueStore.getState();
      expect(state.currentTrack).toEqual(t1);
      expect(state.hasNext).toBe(false);
      expect(state.hasPrevious).toBe(false);
    });

    it("clears queue when called with empty array", () => {
      useQueueStore.getState().setQueue([t1, t2], 0);
      useQueueStore.getState().setQueue([], 0);
      expect(useQueueStore.getState().currentTrack).toBeNull();
    });
  });

  // ── playNext ─────────────────────────────────────────────────────────────

  describe("playNext()", () => {
    it("inserts track immediately after currentIndex", () => {
      // Playing t3 (index 2) in [t1, t2, t3, t4, t5]
      useQueueStore.getState().setQueue([t1, t2, t3, t4, t5], 2);
      useQueueStore.getState().playNext(makeTrack("x", "Song X"));

      const { tracks } = useQueueStore.getState();
      expect(tracks.map((t) => t.id)).toEqual(["1", "2", "3", "x", "4", "5"]);
    });

    it("preserves currentIndex (still on t3)", () => {
      useQueueStore.getState().setQueue([t1, t2, t3, t4, t5], 2);
      useQueueStore.getState().playNext(makeTrack("x"));
      expect(useQueueStore.getState().currentIndex).toBe(2);
      expect(useQueueStore.getState().currentTrack).toEqual(t3);
    });

    it("sets hasNext true after insert", () => {
      // Only one track, no next
      useQueueStore.getState().setQueue([t1], 0);
      expect(useQueueStore.getState().hasNext).toBe(false);

      useQueueStore.getState().playNext(t2);
      expect(useQueueStore.getState().hasNext).toBe(true);
    });

    it("inserted track plays next, album continues after it", () => {
      // Playing t3 (index 2); after Play Next on X: [t1,t2,t3,X,t4,t5]
      // calling next() twice: first gives X, second gives t4
      useQueueStore.getState().setQueue([t1, t2, t3, t4, t5], 2);
      useQueueStore.getState().playNext(makeTrack("x", "Song X"));

      const first = useQueueStore.getState().next();
      expect(first?.id).toBe("x");

      const second = useQueueStore.getState().next();
      expect(second?.id).toBe("4");
    });
  });

  // ── addToQueue ───────────────────────────────────────────────────────────

  describe("addToQueue()", () => {
    it("appends track to the end", () => {
      useQueueStore.getState().setQueue([t1, t2, t3], 1);
      useQueueStore.getState().addToQueue(t4);
      const { tracks } = useQueueStore.getState();
      expect(tracks.map((t) => t.id)).toEqual(["1", "2", "3", "4"]);
    });

    it("preserves currentIndex and currentTrack", () => {
      useQueueStore.getState().setQueue([t1, t2], 0);
      useQueueStore.getState().addToQueue(t3);
      expect(useQueueStore.getState().currentIndex).toBe(0);
      expect(useQueueStore.getState().currentTrack).toEqual(t1);
    });

    it("sets hasNext true when adding to a single-track queue at index 0", () => {
      useQueueStore.getState().setQueue([t1], 0);
      useQueueStore.getState().addToQueue(t2);
      expect(useQueueStore.getState().hasNext).toBe(true);
    });

    it("does not affect hasPrevious", () => {
      useQueueStore.getState().setQueue([t1], 0);
      useQueueStore.getState().addToQueue(t2);
      expect(useQueueStore.getState().hasPrevious).toBe(false);
    });
  });

  // ── next ─────────────────────────────────────────────────────────────────

  describe("next()", () => {
    it("returns the next track and advances index", () => {
      useQueueStore.getState().setQueue([t1, t2, t3], 0);
      const result = useQueueStore.getState().next();
      expect(result).toEqual(t2);
      expect(useQueueStore.getState().currentIndex).toBe(1);
      expect(useQueueStore.getState().currentTrack).toEqual(t2);
    });

    it("returns null at the last track", () => {
      useQueueStore.getState().setQueue([t1, t2], 1);
      const result = useQueueStore.getState().next();
      expect(result).toBeNull();
      expect(useQueueStore.getState().currentIndex).toBe(1);
    });

    it("returns null on empty queue", () => {
      const result = useQueueStore.getState().next();
      expect(result).toBeNull();
    });

    it("updates hasNext and hasPrevious after advance", () => {
      useQueueStore.getState().setQueue([t1, t2, t3], 0);
      useQueueStore.getState().next(); // now at index 1
      expect(useQueueStore.getState().hasNext).toBe(true);
      expect(useQueueStore.getState().hasPrevious).toBe(true);

      useQueueStore.getState().next(); // now at index 2 (last)
      expect(useQueueStore.getState().hasNext).toBe(false);
      expect(useQueueStore.getState().hasPrevious).toBe(true);
    });
  });

  // ── previous ─────────────────────────────────────────────────────────────

  describe("previous()", () => {
    it("returns the previous track and decrements index", () => {
      useQueueStore.getState().setQueue([t1, t2, t3], 2);
      const result = useQueueStore.getState().previous();
      expect(result).toEqual(t2);
      expect(useQueueStore.getState().currentIndex).toBe(1);
      expect(useQueueStore.getState().currentTrack).toEqual(t2);
    });

    it("returns null at the first track", () => {
      useQueueStore.getState().setQueue([t1, t2], 0);
      const result = useQueueStore.getState().previous();
      expect(result).toBeNull();
      expect(useQueueStore.getState().currentIndex).toBe(0);
    });

    it("returns null on empty queue", () => {
      const result = useQueueStore.getState().previous();
      expect(result).toBeNull();
    });

    it("updates hasNext and hasPrevious after decrement", () => {
      useQueueStore.getState().setQueue([t1, t2, t3], 2);
      useQueueStore.getState().previous(); // now at index 1
      expect(useQueueStore.getState().hasNext).toBe(true);
      expect(useQueueStore.getState().hasPrevious).toBe(true);

      useQueueStore.getState().previous(); // now at index 0 (first)
      expect(useQueueStore.getState().hasNext).toBe(true);
      expect(useQueueStore.getState().hasPrevious).toBe(false);
    });
  });
});
